using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.Projects;

public class GetProjectDashboardStatsQueryHandler : IRequestHandler<GetProjectDashboardStatsQuery, ProjectDashboardStatsDto>
{
    private readonly IProjectRepository _repository;

    public GetProjectDashboardStatsQueryHandler(IProjectRepository repository) => _repository = repository;

    public async Task<ProjectDashboardStatsDto> Handle(GetProjectDashboardStatsQuery request, CancellationToken ct)
    {
        var stats = await _repository.GetDashboardStatsAsync(ct);
        return new ProjectDashboardStatsDto(
            stats.TotalActive, stats.TotalOnHold, stats.TotalCompleted,
            stats.OverdueCount, stats.OverBudgetCount,
            stats.TotalBudget, stats.TotalSpent,
            stats.TotalBudget == 0 ? 0 : Math.Round((stats.TotalSpent / stats.TotalBudget) * 100, 2));
    }
}
