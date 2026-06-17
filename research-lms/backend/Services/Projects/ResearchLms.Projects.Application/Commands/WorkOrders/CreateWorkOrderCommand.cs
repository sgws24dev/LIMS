using MediatR;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.Commands.WorkOrders;

public record CreateWorkOrderCommand(
    Guid ProjectId,
    Guid? CostCenterId,
    string Title,
    string? Description,
    Priority Priority,
    Guid? AssignedToId,
    string? AssignedToName,
    decimal EstimatedHours,
    DateOnly? StartDate,
    DateOnly? DueDate,
    string? Tags
) : IRequest<Guid>;
