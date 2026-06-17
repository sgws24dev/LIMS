using MediatR;

namespace ResearchLms.Projects.Application.Commands.CostCenters;

public record UpdateCostCenterCommand(
    Guid CostCenterId,
    string Name,
    string? Description,
    decimal BudgetAmount,
    Guid? ManagerId,
    string? ManagerName,
    bool IsActive
) : IRequest<Unit>;
