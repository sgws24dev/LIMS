using Microsoft.EntityFrameworkCore;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;
using ResearchLms.Projects.Infrastructure.Persistence;

namespace ResearchLms.Projects.Infrastructure.Repositories;

public class WorkOrderRepository : IWorkOrderRepository
{
    private readonly ProjectsDbContext _context;

    public WorkOrderRepository(ProjectsDbContext context)
    {
        _context = context;
    }

    public async Task<WorkOrder?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.WorkOrders.Include(w => w.Project).FirstOrDefaultAsync(w => w.Id == id, ct);

    public async Task<IEnumerable<WorkOrder>> GetByProjectAsync(Guid projectId, CancellationToken ct = default)
        => await _context.WorkOrders.Where(w => w.ProjectId == projectId)
            .OrderByDescending(w => w.UpdatedAt).ToListAsync(ct);

    public async Task<PagedResult<WorkOrder>> GetPagedAsync(Guid? projectId, WorkOrderStatus? status,
        Guid? assignedToId, Priority? priority, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.WorkOrders.Include(w => w.Project).AsQueryable();

        if (projectId.HasValue) query = query.Where(w => w.ProjectId == projectId.Value);
        if (status.HasValue) query = query.Where(w => w.Status == status.Value);
        if (assignedToId.HasValue) query = query.Where(w => w.AssignedToId == assignedToId.Value);
        if (priority.HasValue) query = query.Where(w => w.Priority == priority.Value);

        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(w => w.UpdatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<WorkOrder>(items, total, page, pageSize);
    }

    public async Task AddAsync(WorkOrder workOrder, CancellationToken ct = default)
    {
        await _context.WorkOrders.AddAsync(workOrder, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(WorkOrder workOrder, CancellationToken ct = default)
    {
        _context.WorkOrders.Update(workOrder);
        await _context.SaveChangesAsync(ct);
    }
}
