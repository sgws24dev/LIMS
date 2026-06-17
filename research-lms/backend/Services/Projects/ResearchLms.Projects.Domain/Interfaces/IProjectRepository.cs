using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Domain.Interfaces;

public interface IProjectRepository
{
    Task<Project?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Project?> GetByIdWithWorkOrdersAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<Project>> GetPagedAsync(
        ProjectStatus? status,
        Guid? projectManagerId,
        bool includeArchived,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task<ProjectDashboardStats> GetDashboardStatsAsync(CancellationToken ct = default);
    Task<IEnumerable<Project>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Project project, CancellationToken ct = default);
    Task UpdateAsync(Project project, CancellationToken ct = default);
}

public record ProjectDashboardStats(
    int TotalActive,
    int TotalOnHold,
    int TotalCompleted,
    int OverdueCount,
    int OverBudgetCount,
    decimal TotalBudget,
    decimal TotalSpent
);

public record PagedResult<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize
);
