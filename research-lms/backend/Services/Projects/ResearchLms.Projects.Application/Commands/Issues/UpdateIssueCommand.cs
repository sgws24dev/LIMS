using MediatR;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.Commands.Issues;

public record UpdateIssueCommand(
    Guid IssueId,
    string Title,
    string? Description,
    IssueSeverity Severity,
    IssueType Type,
    Priority Priority,
    Guid? ProjectId,
    Guid? WorkOrderId,
    Guid? AssignedToId,
    string? AssignedToName,
    DateTime? DueDate,
    string? Tags
) : IRequest<Unit>;
