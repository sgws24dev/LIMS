using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.CostCenters;

public class GetCostCentersQueryHandler : IRequestHandler<GetCostCentersQuery, IEnumerable<CostCenterDto>>
{
    private readonly ICostCenterRepository _repository;

    public GetCostCentersQueryHandler(ICostCenterRepository repository) => _repository = repository;

    public async Task<IEnumerable<CostCenterDto>> Handle(GetCostCentersQuery request, CancellationToken ct)
    {
        var centers = await _repository.GetAllAsync(request.ActiveOnly, request.FiscalYear, ct);
        return centers.Select(c => new CostCenterDto(
            c.Id, c.Code, c.Name, c.Description,
            c.BudgetAmount, c.SpentAmount, c.RemainingBudget,
            c.UtilizationPercent, c.IsOverBudget,
            c.ManagerName, c.IsActive, c.FiscalYear));
    }
}
