namespace ResearchLms.Projects.Application.DTOs;

public record CostCenterDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    decimal BudgetAmount,
    decimal SpentAmount,
    decimal RemainingBudget,
    decimal UtilizationPercent,
    bool IsOverBudget,
    string? ManagerName,
    bool IsActive,
    int FiscalYear
);

public record CostCenterSpendSummaryDto(
    Guid CostCenterId,
    string Code,
    string Name,
    decimal BudgetAmount,
    decimal SpentAmount,
    decimal RemainingBudget,
    decimal UtilizationPercent,
    bool IsOverBudget,
    IEnumerable<WorkOrderSpendItemDto> WorkOrders
);

public record WorkOrderSpendItemDto(
    Guid WorkOrderId,
    string WorkOrderTitle,
    string ProjectName,
    decimal BilledAmount,
    DateTime? CompletedAt
);
