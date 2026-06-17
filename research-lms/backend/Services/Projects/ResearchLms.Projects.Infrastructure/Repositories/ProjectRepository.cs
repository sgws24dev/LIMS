using Microsoft.EntityFrameworkCore;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;
using ResearchLms.Projects.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Projects.Infrastructure.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly ProjectsDbContext _context;
    private readonly ITenantContext _tenant;

    public ProjectRepository(ProjectsDbContext context, ITenantContext tenant)
    {
        _context = context;
        _tenant = tenant;
    }

    public async Task<Project?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Projects.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Project?> GetByIdWithWorkOrdersAsync(Guid id, CancellationToken ct = default)
        => await _context.Projects.Include(p => p.WorkOrders).FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<PagedResult<Project>> GetPagedAsync(ProjectStatus? status, Guid? projectManagerId,
        bool includeArchived, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.Projects.AsQueryable();

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);
        if (projectManagerId.HasValue)
            query = query.Where(p => p.ProjectManagerId == projectManagerId.Value);
        if (!includeArchived)
            query = query.Where(p => !p.IsArchived);

        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(p => p.UpdatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<Project>(items, total, page, pageSize);
    }

    public async Task<ProjectDashboardStats> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var projects = await _context.Projects.Where(p => !p.IsArchived).ToListAsync(ct);
        return new ProjectDashboardStats(
            TotalActive: projects.Count(p => p.Status == ProjectStatus.Active),
            TotalOnHold: projects.Count(p => p.Status == ProjectStatus.OnHold),
            TotalCompleted: projects.Count(p => p.Status == ProjectStatus.Completed),
            OverdueCount: projects.Count(p =>
                p.EndDate.HasValue && p.EndDate.Value < DateOnly.FromDateTime(DateTime.UtcNow) &&
                p.Status != ProjectStatus.Completed && p.Status != ProjectStatus.Cancelled),
            OverBudgetCount: projects.Count(p => p.IsOverBudget),
            TotalBudget: projects.Sum(p => p.Budget),
            TotalSpent: projects.Sum(p => p.Spent)
        );
    }

    public async Task<IEnumerable<Project>> GetAllAsync(CancellationToken ct = default)
        => await _context.Projects.OrderByDescending(p => p.UpdatedAt).ToListAsync(ct);

    public async Task AddAsync(Project project, CancellationToken ct = default)
    {
        await _context.Projects.AddAsync(project, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Project project, CancellationToken ct = default)
    {
        _context.Projects.Update(project);
        await _context.SaveChangesAsync(ct);
    }
}
