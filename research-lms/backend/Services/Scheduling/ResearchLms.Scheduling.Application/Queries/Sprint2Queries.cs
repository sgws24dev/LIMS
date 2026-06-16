using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Queries;

public record GetAvailabilityQuery(
    Guid ResourceId,
    DateOnly Date
) : IRequest<IEnumerable<TimeSlotDto>>;

public record GetSlotGridQuery(
    Guid ResourceId,
    DateOnly From,
    DateOnly To
) : IRequest<IEnumerable<SlotAvailabilityDto>>;

public record GetOperatingHoursQuery(Guid ResourceId) : IRequest<ResourceOperatingHoursDto?>;

public record GetConstraintsQuery(
    Guid? ResourceId,
    ConstraintType? Type
) : IRequest<IEnumerable<ConstraintDto>>;

public record EvaluateConstraintsQuery(
    Guid ResourceId,
    Guid UserId,
    DateTime StartTime,
    DateTime EndTime
) : IRequest<ConstraintEvaluationResultDto>;

public record GetWaitlistQuery(
    Guid? UserId,
    Guid? ResourceId,
    WaitlistStatus? Status,
    int Page,
    int PageSize
) : IRequest<(IEnumerable<WaitlistEntryDto> Items, int TotalCount)>;

public record GetWaitlistPositionQuery(Guid EntryId) : IRequest<int>;

public record GetConflictsQuery(
    Guid? ResourceId,
    Guid? UserId,
    DateTime From,
    DateTime To
) : IRequest<IEnumerable<ConflictDto>>;
