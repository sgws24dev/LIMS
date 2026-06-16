using Microsoft.EntityFrameworkCore;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Infrastructure.Persistence;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Repositories;

public class WorkflowInstanceRepository : IWorkflowInstanceRepository
{
    private readonly ServiceWorkflowDbContext _context;

    public WorkflowInstanceRepository(ServiceWorkflowDbContext context)
    {
        _context = context;
    }

    public async Task<WorkflowInstance?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.WorkflowInstances
            .Include(i => i.WorkflowDefinition)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task<WorkflowInstance?> GetByEntityAsync(string entityType, Guid entityId, CancellationToken ct = default)
        => await _context.WorkflowInstances
            .Include(i => i.WorkflowDefinition)
            .FirstOrDefaultAsync(i => i.EntityType == entityType && i.EntityId == entityId, ct);

    public async Task AddAsync(WorkflowInstance instance, CancellationToken ct = default)
    {
        await _context.WorkflowInstances.AddAsync(instance, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(WorkflowInstance instance, CancellationToken ct = default)
    {
        _context.WorkflowInstances.Update(instance);
        await _context.SaveChangesAsync(ct);
    }
}
