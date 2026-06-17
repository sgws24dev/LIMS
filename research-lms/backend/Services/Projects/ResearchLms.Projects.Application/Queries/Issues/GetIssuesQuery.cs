using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.Issues;

public record GetIssuesQuery(
    IssueStatus? Status,
    IssueSeverity? Severity,
    IssueType? Type,
    Guid? ProjectId,
    Guid? WorkOrderId,
    Guid? AssignedToId,
    Guid? ReportedById,
    int Page,
    int PageSize
) : IRequest<PagedResult<IssueDto>>;
