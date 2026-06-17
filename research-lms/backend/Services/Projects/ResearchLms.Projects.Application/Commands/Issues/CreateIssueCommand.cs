using MediatR;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.Commands.Issues;

public record CreateIssueCommand(
    string Title,
    string? Description,
    IssueSeverity Severity,
    IssueType Type,
    Priority Priority,
    Guid? ProjectId,
    Guid? WorkOrderId,
    Guid? AssignedToId,
    string? AssignedToName,
    Guid ReportedById,
    string ReportedByName,
    DateTime? DueDate,
    string? Tags
) : IRequest<Guid>;
