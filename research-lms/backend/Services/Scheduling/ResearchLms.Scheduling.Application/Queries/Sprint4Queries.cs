using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Queries;

public record GetCalendarSyncStatusQuery(Guid UserId)
    : IRequest<ResearchLms.Scheduling.Domain.Interfaces.CalendarSyncStatusDto>;

public record GetSyncLogsQuery(Guid UserId, int Page, int PageSize)
    : IRequest<PagedResult<CalendarSyncLogDto>>;

public record GetCalendarAuthUrlQuery(
    SyncProvider Provider,
    string RedirectUri,
    Guid UserId
) : IRequest<string>;

public record GetTrainerAvailabilityQuery(
    Guid UserId,
    DateOnly? WeekStartDate
) : IRequest<IEnumerable<TrainerAvailabilityDto>>;

public record GetAvailableTrainersQuery(
    string RequiredRole,
    DateTime SlotStart,
    DateTime SlotEnd
) : IRequest<IEnumerable<TrainerAvailabilityDto>>;

public record GetMyBookingStatsQuery(Guid UserId)
    : IRequest<MyBookingStatsDto>;
