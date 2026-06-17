using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.Projects;

public class GetProjectByIdQueryHandler : IRequestHandler<GetProjectByIdQuery, ProjectDetailDto?>
{
    private readonly IProjectRepository _repository;

    public GetProjectByIdQueryHandler(IProjectRepository repository) => _repository = repository;

    public async Task<ProjectDetailDto?> Handle(GetProjectByIdQuery request, CancellationToken ct)
    {
        var p = await _repository.GetByIdWithWorkOrdersAsync(request.ProjectId, ct);
        if (p is null) return null;

        var activity = p.WorkOrders
            .Where(w => w.UpdatedAt > DateTime.UtcNow.AddDays(-30))
            .OrderByDescending(w => w.UpdatedAt)
            .Take(10)
            .Select(w => new ProjectActivityDto(
                "WorkOrderUpdated",
                $"Work order '{w.Title}' status changed to {w.Status}",
                w.UpdatedAt, w.AssignedToName));

        return new ProjectDetailDto(
            p.Id, p.Name, p.Description, p.Status, p.Priority,
            p.StartDate, p.EndDate, p.Budget, p.Spent,
            p.BudgetUtilizationPercent, p.IsOverBudget, p.IsOverdue,
            p.ProjectManagerName,
            p.WorkOrders.Count,
            p.WorkOrders.Count(w => w.Status == WorkOrderStatus.Open),
            p.CreatedAt, p.UpdatedAt, activity);
    }
}
