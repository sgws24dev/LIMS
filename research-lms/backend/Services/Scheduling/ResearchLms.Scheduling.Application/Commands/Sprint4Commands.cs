using MediatR;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Commands;

public record ConnectCalendarCommand(
    SyncProvider Provider,
    string AuthorizationCode,
    string RedirectUri,
    Guid UserId,
    Guid TenantId
) : IRequest<Unit>;

public record DisconnectCalendarCommand(
    SyncProvider Provider,
    Guid UserId
) : IRequest<Unit>;

public record TriggerManualSyncCommand(
    SyncProvider Provider,
    Guid UserId
) : IRequest<Unit>;

public record AddTrainerAvailabilityCommand(
    Guid UserId,
    string UserName,
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool IsAvailable,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    string? Notes
) : IRequest<Guid>;

public record UpdateTrainerAvailabilityCommand(
    Guid AvailabilityId,
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool IsAvailable,
    DateOnly? EffectiveTo,
    string? Notes
) : IRequest<Unit>;

public record DeleteTrainerAvailabilityCommand(Guid AvailabilityId) : IRequest<Unit>;

public record SyncTrainerCalendarCommand(
    Guid UserId,
    SyncProvider Provider
) : IRequest<Unit>;
