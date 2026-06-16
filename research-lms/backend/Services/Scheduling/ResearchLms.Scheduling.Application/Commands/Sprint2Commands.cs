using MediatR;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Commands;

public record CreateConstraintCommand(
    Guid ResourceId,
    ResourceType ResourceType,
    ConstraintType Type,
    string Value,
    string? Description,
    string? ErrorMessage
) : IRequest<Guid>;

public record UpdateConstraintCommand(
    Guid ConstraintId,
    string Value,
    string? Description,
    string? ErrorMessage,
    bool IsActive
) : IRequest<Unit>;

public record DeleteConstraintCommand(Guid ConstraintId) : IRequest<Unit>;

public record JoinWaitlistCommand(
    Guid ResourceId,
    ResourceType ResourceType,
    DateOnly RequestedDate,
    TimeOnly RequestedStartTime,
    TimeOnly RequestedEndTime,
    Guid UserId,
    string UserName,
    string? Notes
) : IRequest<Guid>;

public record LeaveWaitlistCommand(
    Guid EntryId,
    Guid UserId
) : IRequest<Unit>;
