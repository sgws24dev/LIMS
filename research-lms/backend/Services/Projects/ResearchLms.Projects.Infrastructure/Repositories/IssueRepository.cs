using Microsoft.EntityFrameworkCore;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;
using ResearchLms.Projects.Infrastructure.Persistence;

namespace ResearchLms.Projects.Infrastructure.Repositories;

public class IssueRepository : IIssueRepository
{
    private readonly ProjectsDbContext _context;

    public IssueRepository(ProjectsDbContext context)
    {
        _context = context;
    }

    public async Task<Issue?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Issues
            .Include(i => i.Project)
            .Include(i => i.WorkOrder)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task<PagedResult<Issue>> GetPagedAsync(IssueStatus? status, IssueSeverity? severity,
        IssueType? type, Guid? projectId, Guid? workOrderId, Guid? assignedToId,
        Guid? reportedById, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.Issues.Include(i => i.Project).AsQueryable();

        if (status.HasValue) query = query.Where(i => i.Status == status.Value);
        if (severity.HasValue) query = query.Where(i => i.Severity == severity.Value);
        if (type.HasValue) query = query.Where(i => i.Type == type.Value);
        if (projectId.HasValue) query = query.Where(i => i.ProjectId == projectId.Value);
        if (workOrderId.HasValue) query = query.Where(i => i.WorkOrderId == workOrderId.Value);
        if (assignedToId.HasValue) query = query.Where(i => i.AssignedToId == assignedToId.Value);
        if (reportedById.HasValue) query = query.Where(i => i.ReportedById == reportedById.Value);

        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<Issue>(items, total, page, pageSize);
    }

    public async Task<Issue?> GetByExternalIdAsync(string externalId, string provider, CancellationToken ct = default)
        => await _context.Issues.FirstOrDefaultAsync(
            i => i.ExternalId == externalId && i.ExternalProvider == provider, ct);

    public async Task<IEnumerable<Issue>> GetAllLinkedAsync(CancellationToken ct = default)
        => await _context.Issues
            .Where(i => i.ExternalId != null && i.ExternalProvider != null)
            .ToListAsync(ct);

    public async Task AddAsync(Issue issue, CancellationToken ct = default)
    {
        await _context.Issues.AddAsync(issue, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Issue issue, CancellationToken ct = default)
    {
        _context.Issues.Update(issue);
        await _context.SaveChangesAsync(ct);
    }
}
