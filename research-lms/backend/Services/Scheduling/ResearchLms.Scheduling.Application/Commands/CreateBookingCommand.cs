using MediatR;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Commands;

public record CreateBookingCommand(
    Guid ResourceId,
    ResourceType ResourceType,
    Guid UserId,
    string UserName,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    string? Purpose,
    string? Notes
) : IRequest<Guid>;
