using MediatR;

namespace ResearchLms.Projects.Application.Commands.CostCenters;

public record CreateCostCenterCommand(
    string Code,
    string Name,
    string? Description,
    decimal BudgetAmount,
    Guid? ManagerId,
    string? ManagerName,
    int? FiscalYear
) : IRequest<Guid>;
