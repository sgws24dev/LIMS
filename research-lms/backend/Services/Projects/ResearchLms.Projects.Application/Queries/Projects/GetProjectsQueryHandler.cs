using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.Projects;

public class GetProjectsQueryHandler : IRequestHandler<GetProjectsQuery, PagedResult<ProjectDto>>
{
    private readonly IProjectRepository _repository;

    public GetProjectsQueryHandler(IProjectRepository repository) => _repository = repository;

    public async Task<PagedResult<ProjectDto>> Handle(GetProjectsQuery request, CancellationToken ct)
    {
        var result = await _repository.GetPagedAsync(request.Status, request.ProjectManagerId,
            request.IncludeArchived, request.Page, request.PageSize, ct);
        return new PagedResult<ProjectDto>(
            result.Items.Select(MapToDto),
            result.TotalCount, result.Page, result.PageSize);
    }

    private static ProjectDto MapToDto(Project p) => new(
        p.Id, p.Name, p.Description, p.Status, p.Priority,
        p.StartDate, p.EndDate, p.Budget, p.Spent,
        p.BudgetUtilizationPercent, p.IsOverBudget, p.IsOverdue,
        p.ProjectManagerName,
        p.WorkOrders.Count,
        p.WorkOrders.Count(w => w.Status == WorkOrderStatus.Open),
        p.CreatedAt, p.UpdatedAt);
}
