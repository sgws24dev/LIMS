using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Queries;

public class GetCalendarSyncStatusQueryHandler : IRequestHandler<GetCalendarSyncStatusQuery, CalendarSyncStatusDto>
{
    private readonly ICalendarSyncService _syncService;

    public GetCalendarSyncStatusQueryHandler(ICalendarSyncService syncService)
        => _syncService = syncService;

    public async Task<CalendarSyncStatusDto> Handle(GetCalendarSyncStatusQuery q, CancellationToken ct)
        => await _syncService.GetStatusAsync(q.UserId, ct);
}

public class GetCalendarAuthUrlQueryHandler : IRequestHandler<GetCalendarAuthUrlQuery, string>
{
    private readonly ICalendarSyncService _syncService;

    public GetCalendarAuthUrlQueryHandler(ICalendarSyncService syncService)
        => _syncService = syncService;

    public Task<string> Handle(GetCalendarAuthUrlQuery q, CancellationToken ct)
        => Task.FromResult(_syncService.GetAuthorizationUrl(q.Provider, q.UserId.ToString(), q.RedirectUri));
}

public class GetSyncLogsQueryHandler : IRequestHandler<GetSyncLogsQuery, PagedResult<CalendarSyncLogDto>>
{
    private readonly ICalendarSyncLogRepository _repo;

    public GetSyncLogsQueryHandler(ICalendarSyncLogRepository repo)
        => _repo = repo;

    public async Task<PagedResult<CalendarSyncLogDto>> Handle(GetSyncLogsQuery q, CancellationToken ct)
    {
        var (items, total) = await _repo.GetPagedAsync(q.UserId, q.Page, q.PageSize, ct);

        var dtos = items.Select(l => new CalendarSyncLogDto(
            l.Id, l.Provider, l.Direction, l.Status,
            l.EventsCreated, l.EventsUpdated, l.EventsDeleted,
            l.ErrorMessage, l.SyncedAt));

        return new PagedResult<CalendarSyncLogDto>(dtos, total);
    }
}

public class GetTrainerAvailabilityQueryHandler : IRequestHandler<GetTrainerAvailabilityQuery, IEnumerable<TrainerAvailabilityDto>>
{
    private readonly ITrainerAvailabilityRepository _repo;

    public GetTrainerAvailabilityQueryHandler(ITrainerAvailabilityRepository repo)
        => _repo = repo;

    public async Task<IEnumerable<TrainerAvailabilityDto>> Handle(GetTrainerAvailabilityQuery q, CancellationToken ct)
    {
        var items = q.WeekStartDate.HasValue
            ? await _repo.GetByUserAndRangeAsync(q.UserId, q.WeekStartDate.Value, ct)
            : await _repo.GetByUserAsync(q.UserId, ct);

        return items.Select(t => new TrainerAvailabilityDto(
            t.Id, t.UserId, t.UserName, t.DayOfWeek,
            t.StartTime, t.EndTime, t.IsAvailable,
            t.EffectiveFrom, t.EffectiveTo, t.Source, t.Notes));
    }
}

public class GetAvailableTrainersQueryHandler : IRequestHandler<GetAvailableTrainersQuery, IEnumerable<TrainerAvailabilityDto>>
{
    private readonly ITrainerSyncService _syncService;

    public GetAvailableTrainersQueryHandler(ITrainerSyncService syncService)
        => _syncService = syncService;

    public async Task<IEnumerable<TrainerAvailabilityDto>> Handle(GetAvailableTrainersQuery q, CancellationToken ct)
    {
        var items = await _syncService.GetAvailableTrainersAsync(q.RequiredRole, q.SlotStart, q.SlotEnd, ct);

        return items.Select(t => new TrainerAvailabilityDto(
            t.Id, t.UserId, t.UserName, t.DayOfWeek,
            t.StartTime, t.EndTime, t.IsAvailable,
            t.EffectiveFrom, t.EffectiveTo, t.Source, t.Notes));
    }
}

public class GetMyBookingStatsQueryHandler : IRequestHandler<GetMyBookingStatsQuery, MyBookingStatsDto>
{
    private readonly IBookingRepository _repo;

    public GetMyBookingStatsQueryHandler(IBookingRepository repo)
        => _repo = repo;

    public async Task<MyBookingStatsDto> Handle(GetMyBookingStatsQuery q, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthEnd = monthStart.AddMonths(1);

        var upcomingFilter = new BookingFilter(
            UserId: q.UserId,
            ResourceId: null,
            ResourceType: null,
            Status: null,
            From: now,
            To: null,
            Search: null);

        var (upcomingItems, _) = await _repo.GetPagedAsync(upcomingFilter, 1, int.MaxValue, ct);

        var upcomingCount = upcomingItems.Count(b =>
            b.Status == BookingStatus.Pending
            || b.Status == BookingStatus.Confirmed
            || b.Status == BookingStatus.InProgress);

        var monthlyBookings = await _repo.GetByUserAndRangeAsync(q.UserId, monthStart, monthEnd, ct);

        var activeMonthly = monthlyBookings.Where(b =>
            b.Status != BookingStatus.Cancelled
            && b.Status != BookingStatus.NoShow);

        var monthlySpend = activeMonthly.Sum(b => b.Cost ?? 0);
        var monthlyHours = activeMonthly.Sum(b => (b.EndTime - b.StartTime).TotalHours);

        return new MyBookingStatsDto(upcomingCount, monthlySpend, monthlyHours);
    }
}
