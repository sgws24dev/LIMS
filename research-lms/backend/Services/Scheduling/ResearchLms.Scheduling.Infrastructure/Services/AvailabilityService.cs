using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;
using System.Text.Json;

namespace ResearchLms.Scheduling.Infrastructure.Services;

public class AvailabilityService : IAvailabilityService
{
    private readonly IBookingRepository _bookingRepo;
    private readonly IMaintenanceWindowRepository _maintenanceRepo;
    private readonly IDistributedCache _cache;
    private readonly ITenantContext _tenantContext;
    private readonly Persistence.SchedulingDbContext _db;

    private static readonly TimeOnly DefaultOpen = new(7, 0);
    private static readonly TimeOnly DefaultClose = new(20, 0);

    public AvailabilityService(
        IBookingRepository bookingRepo,
        IMaintenanceWindowRepository maintenanceRepo,
        IDistributedCache cache,
        ITenantContext tenantContext,
        Persistence.SchedulingDbContext db)
    {
        _bookingRepo = bookingRepo;
        _maintenanceRepo = maintenanceRepo;
        _cache = cache;
        _tenantContext = tenantContext;
        _db = db;
    }

    public async Task<IEnumerable<TimeSlot>> GetAvailableSlotsAsync(
        Guid resourceId, DateOnly date, CancellationToken ct)
    {
        var grid = await GetSlotGridAsync(resourceId, date, date, ct);
        var gridList = grid.ToList();

        var merged = new List<TimeSlot>();
        DateTime? windowStart = null;

        foreach (var slot in gridList)
        {
            if (slot.Status == SlotStatus.Available)
            {
                windowStart ??= slot.SlotStart;
            }
            else if (windowStart.HasValue)
            {
                merged.Add(new TimeSlot(windowStart.Value, slot.SlotStart));
                windowStart = null;
            }
        }

        if (windowStart.HasValue)
        {
            var lastEnd = gridList.LastOrDefault()?.SlotEnd ?? windowStart.Value.AddDays(1);
            merged.Add(new TimeSlot(windowStart.Value, lastEnd));
        }

        return merged;
    }

    public async Task<IEnumerable<SlotAvailability>> GetSlotGridAsync(
        Guid resourceId, DateOnly from, DateOnly to, CancellationToken ct)
    {
        if (to < from) return Enumerable.Empty<SlotAvailability>();

        var tenantId = _tenantContext.TenantId;
        var allSlots = new List<SlotAvailability>();
        var current = from;

        while (current <= to)
        {
            var cacheKey = $"availability:{tenantId}:{resourceId}:{current:yyyy-MM-dd}";
            var cached = await _cache.GetStringAsync(cacheKey, ct);

            if (cached is not null)
            {
                var deserialized = JsonSerializer.Deserialize<List<SlotAvailability>>(cached);
                if (deserialized is not null)
                {
                    allSlots.AddRange(deserialized);
                    current = current.AddDays(1);
                    continue;
                }
            }

            var dayStart = current.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var dayEnd = dayStart.AddDays(1);

            var activeBookings = (await _bookingRepo.GetByResourceAndRangeAsync(
                resourceId, dayStart, dayEnd, ct))
                .Where(b => b.Status != Domain.Enums.BookingStatus.Cancelled &&
                            b.Status != Domain.Enums.BookingStatus.NoShow)
                .Select(b => (b.StartTime, b.EndTime))
                .ToList();

            var maintenanceWindows = (await _maintenanceRepo.GetByResourceAndRangeAsync(
                resourceId, dayStart, dayEnd, ct))
                .Select(m => (m.StartTime, m.EndTime))
                .ToList();

            var operatingHours = await _db.ResourceOperatingHours
                .FirstOrDefaultAsync(h => h.ResourceId == resourceId, ct);

            var hours = GetDayHours(operatingHours, current.DayOfWeek);

            var slots = new List<SlotAvailability>();
            var cursor = dayStart;

            while (cursor < dayEnd)
            {
                var slotEnd = cursor.AddMinutes(15);
                var (status, reason) = DetermineStatus(cursor, slotEnd, hours, activeBookings, maintenanceWindows);
                slots.Add(new SlotAvailability(cursor, slotEnd, status, reason));
                cursor = slotEnd;
            }

            await _cache.SetStringAsync(cacheKey,
                JsonSerializer.Serialize(slots),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                }, ct);

            allSlots.AddRange(slots);
            current = current.AddDays(1);
        }

        return allSlots;
    }

    public async Task InvalidateCacheAsync(Guid resourceId, DateOnly date)
    {
        var cacheKey = $"availability:{_tenantContext.TenantId}:{resourceId}:{date:yyyy-MM-dd}";
        await _cache.RemoveAsync(cacheKey);
    }

    private static (TimeOnly? Open, TimeOnly? Close) GetDayHours(
        ResourceOperatingHours? hours, DayOfWeek day)
    {
        if (hours is null) return (DefaultOpen, DefaultClose);

        var (start, end) = day switch
        {
            DayOfWeek.Monday => (hours.MondayStart, hours.MondayEnd),
            DayOfWeek.Tuesday => (hours.TuesdayStart, hours.TuesdayEnd),
            DayOfWeek.Wednesday => (hours.WednesdayStart, hours.WednesdayEnd),
            DayOfWeek.Thursday => (hours.ThursdayStart, hours.ThursdayEnd),
            DayOfWeek.Friday => (hours.FridayStart, hours.FridayEnd),
            DayOfWeek.Saturday => (hours.SaturdayStart, hours.SaturdayEnd),
            DayOfWeek.Sunday => (hours.SundayStart, hours.SundayEnd),
            _ => (DefaultOpen, DefaultClose)
        };

        return (start ?? DefaultOpen, end ?? DefaultClose);
    }

    private static (SlotStatus Status, string? Reason) DetermineStatus(
        DateTime slotStart, DateTime slotEnd,
        (TimeOnly? Open, TimeOnly? Close) hours,
        List<(DateTime Start, DateTime End)> activeBookings,
        List<(DateTime Start, DateTime End)> maintenanceWindows)
    {
        var startTime = TimeOnly.FromDateTime(slotStart);
        var endTime = TimeOnly.FromDateTime(slotEnd);

        if (hours.Open.HasValue && startTime < hours.Open.Value)
            return (SlotStatus.OutsideHours, "Outside operating hours");
        if (hours.Close.HasValue && endTime > hours.Close.Value)
            return (SlotStatus.OutsideHours, "Outside operating hours");

        foreach (var m in maintenanceWindows)
        {
            if (slotStart < m.End && slotEnd > m.Start)
                return (SlotStatus.Maintenance, "Scheduled maintenance");
        }

        foreach (var b in activeBookings)
        {
            if (slotStart < b.End && slotEnd > b.Start)
                return (SlotStatus.Booked, "Booked");
        }

        return (SlotStatus.Available, null);
    }
}
