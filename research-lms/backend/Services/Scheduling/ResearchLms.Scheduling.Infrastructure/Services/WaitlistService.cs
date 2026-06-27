using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Exceptions;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Scheduling.Infrastructure.Services;

public class WaitlistService : IWaitlistService
{
    private readonly IWaitlistRepository _repo;
    private readonly IBookingRepository _bookingRepo;
    private readonly Persistence.SchedulingDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly ResearchLms.Scheduling.Domain.Interfaces.INotificationService _notificationService;

    public WaitlistService(
        IWaitlistRepository repo,
        IBookingRepository bookingRepo,
        Persistence.SchedulingDbContext db,
        ITenantContext tenantContext,
        ResearchLms.Scheduling.Domain.Interfaces.INotificationService notificationService)
    {
        _repo = repo;
        _bookingRepo = bookingRepo;
        _db = db;
        _tenantContext = tenantContext;
        _notificationService = notificationService;
    }

    public async Task<Guid> JoinAsync(Guid resourceId, ResourceType resourceType,
        DateOnly requestedDate, TimeOnly requestedStartTime, TimeOnly requestedEndTime,
        Guid userId, string userName, string? notes, CancellationToken ct)
    {
        var existing = await _repo.HasExistingWaitingAsync(
            userId, resourceId, requestedDate, requestedStartTime, requestedEndTime, ct);
        if (existing)
            throw new DuplicateWaitlistEntryException();

        var entry = new WaitlistEntry
        {
            TenantId = _tenantContext.TenantId,
            ResourceId = resourceId,
            ResourceType = resourceType,
            RequestedDate = requestedDate,
            RequestedStartTime = requestedStartTime,
            RequestedEndTime = requestedEndTime,
            UserId = userId,
            UserName = userName,
            Notes = notes,
            Status = WaitlistStatus.Waiting
        };

        await _repo.AddAsync(entry, ct);
        return entry.Id;
    }

    public async Task<int> GetPositionAsync(Guid entryId, CancellationToken ct)
    {
        var entry = await _repo.GetByIdAsync(entryId, ct);
        if (entry is null) return -1;

        var ahead = await _db.WaitlistEntries
            .CountAsync(w =>
                w.ResourceId == entry.ResourceId &&
                w.RequestedDate == entry.RequestedDate &&
                w.Status == WaitlistStatus.Waiting &&
                (w.Priority > entry.Priority ||
                 (w.Priority == entry.Priority && w.CreatedAt < entry.CreatedAt)), ct);

        return ahead + 1;
    }

    public async Task PromoteNextAsync(Guid resourceId, DateOnly date,
        TimeOnly start, TimeOnly end, CancellationToken ct)
    {
        var next = await _repo.GetNextForPromotionAsync(resourceId, date, start, end, ct);
        if (next is null) return;

        var startDt = date.ToDateTime(start, DateTimeKind.Utc);
        var endDt = date.ToDateTime(end, DateTimeKind.Utc);

        var booking = new Booking(
            resourceId, next.ResourceType,
            next.UserId, next.UserName,
            "Waitlist Promotion", startDt, endDt,
            null, next.Notes);

        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            await _bookingRepo.AddAsync(booking, ct);

            next.Status = WaitlistStatus.Promoted;
            next.PromotedAt = DateTime.UtcNow;
            next.ExpiresAt = DateTime.UtcNow.AddHours(24);
            next.ProvisionalBookingId = booking.Id;
            await _repo.UpdateAsync(next, ct);

            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }

        try
        {
            await _notificationService.SendWaitlistPromotionAsync(next);
        }
        catch
        {
            // fire-and-forget
        }
    }

    public async Task ExpireStalePromotionsAsync(CancellationToken ct)
    {
        var stale = await _repo.GetStalePromotionsAsync(ct);
        foreach (var entry in stale)
        {
            entry.Status = WaitlistStatus.Expired;

            if (entry.ProvisionalBookingId.HasValue)
            {
                var booking = await _bookingRepo.GetByIdAsync(entry.ProvisionalBookingId.Value, ct);
                if (booking is not null)
                {
                    booking.Cancel("Waitlist promotion expired");
                    await _bookingRepo.UpdateAsync(booking, ct);
                }
            }

            await _repo.UpdateAsync(entry, ct);

            await PromoteNextAsync(entry.ResourceId, entry.RequestedDate,
                entry.RequestedStartTime, entry.RequestedEndTime, ct);
        }
    }
}
