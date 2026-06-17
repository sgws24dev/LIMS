using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.CostCenters;

public class GetCostCenterSpendQueryHandler : IRequestHandler<GetCostCenterSpendQuery, CostCenterSpendSummaryDto>
{
    private readonly ICostCenterRepository _repository;

    public GetCostCenterSpendQueryHandler(ICostCenterRepository repository) => _repository = repository;

    public async Task<CostCenterSpendSummaryDto> Handle(GetCostCenterSpendQuery request, CancellationToken ct)
    {
        var summary = await _repository.GetSpendSummaryAsync(request.CostCenterId, ct);
        return new CostCenterSpendSummaryDto(
            summary.CostCenterId, summary.Code, summary.Name,
            summary.BudgetAmount, summary.SpentAmount,
            summary.RemainingBudget, summary.UtilizationPercent,
            summary.IsOverBudget,
            summary.WorkOrders.Select(w => new WorkOrderSpendItemDto(
                w.WorkOrderId, w.WorkOrderTitle, w.ProjectName,
                w.BilledAmount, w.CompletedAt)));
    }
}
