using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.DTOs;

public record WorkOrderDto(
    Guid Id,
    Guid ProjectId,
    string ProjectName,
    string Title,
    WorkOrderStatus Status,
    Priority Priority,
    string? AssignedToName,
    decimal EstimatedHours,
    decimal ActualHours,
    DateOnly? DueDate,
    bool IsOverdue,
    string? Tags,
    DateTime CreatedAt
);

public record WorkOrderDetailDto(
    Guid Id,
    Guid ProjectId,
    string ProjectName,
    string Title,
    string? Description,
    WorkOrderStatus Status,
    Priority Priority,
    string? AssignedToName,
    decimal EstimatedHours,
    decimal ActualHours,
    Guid? CostCenterId,
    string? CostCenterName,
    decimal BilledAmount,
    DateOnly? StartDate,
    DateOnly? DueDate,
    bool IsOverdue,
    DateTime? CompletedAt,
    string? Tags,
    DateTime CreatedAt,
    IEnumerable<IssueDto> LinkedIssues
);
