using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.Issues;

public class GetIssueByIdQueryHandler : IRequestHandler<GetIssueByIdQuery, IssueDetailDto?>
{
    private readonly IIssueRepository _repository;

    public GetIssueByIdQueryHandler(IIssueRepository repository) => _repository = repository;

    public async Task<IssueDetailDto?> Handle(GetIssueByIdQuery request, CancellationToken ct)
    {
        var i = await _repository.GetByIdAsync(request.IssueId, ct);
        if (i is null) return null;

        return new IssueDetailDto(
            i.Id, i.Title, i.Description, i.Status, i.Severity, i.Type, i.Priority,
            i.AssignedToName, i.AssignedToId, i.ReportedByName,
            i.ProjectId, i.Project?.Name, i.WorkOrderId, i.WorkOrder?.Title,
            i.ExternalId, i.ExternalUrl, i.ExternalProvider,
            i.DueDate, i.ResolvedAt, i.ClosedAt,
            i.DueDate.HasValue && i.DueDate < DateTime.UtcNow &&
            i.Status != IssueStatus.Resolved && i.Status != IssueStatus.Closed,
            i.Tags, i.CreatedAt, i.UpdatedAt);
    }
}
