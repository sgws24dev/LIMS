using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.DTOs;

public record ProjectDto(
    Guid Id,
    string Name,
    string? Description,
    ProjectStatus Status,
    Priority Priority,
    DateOnly? StartDate,
    DateOnly? EndDate,
    decimal Budget,
    decimal Spent,
    decimal BudgetUtilizationPercent,
    bool IsOverBudget,
    bool IsOverdue,
    string? ProjectManagerName,
    int WorkOrderCount,
    int OpenWorkOrderCount,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record ProjectDetailDto(
    Guid Id,
    string Name,
    string? Description,
    ProjectStatus Status,
    Priority Priority,
    DateOnly? StartDate,
    DateOnly? EndDate,
    decimal Budget,
    decimal Spent,
    decimal BudgetUtilizationPercent,
    bool IsOverBudget,
    bool IsOverdue,
    string? ProjectManagerName,
    int WorkOrderCount,
    int OpenWorkOrderCount,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IEnumerable<ProjectActivityDto> RecentActivity
);

public record ProjectActivityDto(
    string EventType,
    string Description,
    DateTime? OccurredAt,
    string? ActorName
);

public record ProjectDashboardStatsDto(
    int TotalActive,
    int TotalOnHold,
    int TotalCompleted,
    int OverdueCount,
    int OverBudgetCount,
    decimal TotalBudget,
    decimal TotalSpent,
    decimal OverallUtilizationPercent
);

public record MonthlyBudgetDataPoint(
    string MonthLabel,
    decimal Budget,
    decimal Actual
);
