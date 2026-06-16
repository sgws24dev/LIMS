using Microsoft.EntityFrameworkCore;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Persistence;

public class WorkOrderRepository : IWorkOrderRepository
{
    private readonly ResearchLmsDbContext _context;

    public WorkOrderRepository(ResearchLmsDbContext context)
    {
        _context = context;
    }

    public async Task<WorkOrder?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.WorkOrders
            .Include(w => w.MaintenanceRecord).ThenInclude(m => m.Asset)
            .FirstOrDefaultAsync(w => w.Id == id, ct);

    public async Task<IEnumerable<WorkOrder>> GetByMaintenanceRecordIdAsync(Guid maintenanceRecordId, CancellationToken ct = default)
        => await _context.WorkOrders
            .Where(w => w.MaintenanceRecordId == maintenanceRecordId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<WorkOrder>> GetAllAsync(
        Guid? maintenanceRecordId = null, Guid? assigneeId = null,
        string? status = null, string? priority = null, CancellationToken ct = default)
    {
        var query = _context.WorkOrders.AsQueryable();

        if (maintenanceRecordId.HasValue)
            query = query.Where(w => w.MaintenanceRecordId == maintenanceRecordId.Value);
        if (assigneeId.HasValue)
            query = query.Where(w => w.AssigneeId == assigneeId.Value);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(w => w.Status.ToString() == status);
        if (!string.IsNullOrWhiteSpace(priority))
            query = query.Where(w => w.Priority.ToString() == priority);

        return await query.OrderByDescending(w => w.CreatedAt).ToListAsync(ct);
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
