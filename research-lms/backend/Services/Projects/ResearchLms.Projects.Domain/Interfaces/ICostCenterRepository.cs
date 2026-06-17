using ResearchLms.Projects.Domain.Entities;

namespace ResearchLms.Projects.Domain.Interfaces;

public interface ICostCenterRepository
{
    Task<CostCenter?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<CostCenter?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<IEnumerable<CostCenter>> GetAllAsync(bool activeOnly, int? fiscalYear, CancellationToken ct = default);
    Task<CostCenterSpendSummary> GetSpendSummaryAsync(Guid costCenterId, CancellationToken ct = default);
    Task AddAsync(CostCenter costCenter, CancellationToken ct = default);
    Task UpdateAsync(CostCenter costCenter, CancellationToken ct = default);
}

public record CostCenterSpendSummary(
    Guid CostCenterId,
    string Code,
    string Name,
    decimal BudgetAmount,
    decimal SpentAmount,
    decimal RemainingBudget,
    decimal UtilizationPercent,
    bool IsOverBudget,
    IEnumerable<WorkOrderSpendItem> WorkOrders
);

public record WorkOrderSpendItem(
    Guid WorkOrderId,
    string WorkOrderTitle,
    string ProjectName,
    decimal BilledAmount,
    DateTime? CompletedAt
);
