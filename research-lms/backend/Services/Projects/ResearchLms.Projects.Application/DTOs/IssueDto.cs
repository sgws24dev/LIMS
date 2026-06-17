using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.DTOs;

public record IssueDto(
    Guid Id,
    string Title,
    IssueStatus Status,
    IssueSeverity Severity,
    IssueType Type,
    Priority Priority,
    string? AssignedToName,
    string ReportedByName,
    string? ProjectName,
    string? WorkOrderTitle,
    string? ExternalId,
    string? ExternalUrl,
    string? ExternalProvider,
    DateTime? DueDate,
    bool IsOverdue,
    string? Tags,
    DateTime CreatedAt
);

public record IssueDetailDto(
    Guid Id,
    string Title,
    string? Description,
    IssueStatus Status,
    IssueSeverity Severity,
    IssueType Type,
    Priority Priority,
    string? AssignedToName,
    Guid? AssignedToId,
    string ReportedByName,
    Guid? ProjectId,
    string? ProjectName,
    Guid? WorkOrderId,
    string? WorkOrderTitle,
    string? ExternalId,
    string? ExternalUrl,
    string? ExternalProvider,
    DateTime? DueDate,
    DateTime? ResolvedAt,
    DateTime? ClosedAt,
    bool IsOverdue,
    string? Tags,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record ExternalIssueRefDto(
    string ExternalId,
    string ExternalUrl,
    string Provider
);

public record IssueSyncResultDto(
    int Pushed,
    int Pulled,
    int Failed,
    IEnumerable<string> Errors
);
