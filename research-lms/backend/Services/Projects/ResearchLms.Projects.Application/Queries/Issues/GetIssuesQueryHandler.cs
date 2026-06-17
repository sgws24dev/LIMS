using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.Issues;

public class GetIssuesQueryHandler : IRequestHandler<GetIssuesQuery, PagedResult<IssueDto>>
{
    private readonly IIssueRepository _repository;

    public GetIssuesQueryHandler(IIssueRepository repository) => _repository = repository;

    public async Task<PagedResult<IssueDto>> Handle(GetIssuesQuery request, CancellationToken ct)
    {
        var result = await _repository.GetPagedAsync(request.Status, request.Severity,
            request.Type, request.ProjectId, request.WorkOrderId,
            request.AssignedToId, request.ReportedById,
            request.Page, request.PageSize, ct);

        return new PagedResult<IssueDto>(
            result.Items.Select(i => new IssueDto(
                i.Id, i.Title, i.Status, i.Severity, i.Type, i.Priority,
                i.AssignedToName, i.ReportedByName,
                i.Project?.Name, i.WorkOrder?.Title,
                i.ExternalId, i.ExternalUrl, i.ExternalProvider,
                i.DueDate,
                i.DueDate.HasValue && i.DueDate < DateTime.UtcNow &&
                i.Status != IssueStatus.Resolved && i.Status != IssueStatus.Closed,
                i.Tags, i.CreatedAt)),
            result.TotalCount, result.Page, result.PageSize);
    }
}
