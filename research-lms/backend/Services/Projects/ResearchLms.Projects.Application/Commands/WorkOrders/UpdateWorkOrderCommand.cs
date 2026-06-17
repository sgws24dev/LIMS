using MediatR;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.Commands.WorkOrders;

public record UpdateWorkOrderCommand(
    Guid WorkOrderId,
    Guid? CostCenterId,
    string Title,
    string? Description,
    Priority Priority,
    Guid? AssignedToId,
    string? AssignedToName,
    decimal EstimatedHours,
    decimal ActualHours,
    DateOnly? StartDate,
    DateOnly? DueDate,
    string? Tags
) : IRequest<Unit>;
