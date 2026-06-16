using Microsoft.EntityFrameworkCore;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Infrastructure.Persistence;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Repositories;

public class WorkflowDefinitionRepository : IWorkflowDefinitionRepository
{
    private readonly ServiceWorkflowDbContext _context;

    public WorkflowDefinitionRepository(ServiceWorkflowDbContext context)
    {
        _context = context;
    }

    public async Task<WorkflowDefinition?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.WorkflowDefinitions.FirstOrDefaultAsync(w => w.Id == id, ct);

    public async Task<IReadOnlyList<WorkflowDefinition>> GetAllAsync(Guid tenantId, CancellationToken ct = default)
        => await _context.WorkflowDefinitions
            .Where(w => w.TenantId == tenantId)
            .OrderByDescending(w => w.UpdatedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<WorkflowDefinition>> GetPublishedByEntityHintAsync(string? entityTypeHint, CancellationToken ct = default)
    {
        var query = _context.WorkflowDefinitions
            .Where(w => w.IsPublished);

        if (!string.IsNullOrWhiteSpace(entityTypeHint))
            query = query.Where(w => w.EntityTypeHint == entityTypeHint);

        return await query.OrderByDescending(w => w.Version).ToListAsync(ct);
    }

    public async Task AddAsync(WorkflowDefinition definition, CancellationToken ct = default)
    {
        await _context.WorkflowDefinitions.AddAsync(definition, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(WorkflowDefinition definition, CancellationToken ct = default)
    {
        _context.WorkflowDefinitions.Update(definition);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<bool> HasActiveInstancesAsync(Guid definitionId, CancellationToken ct = default)
        => await _context.WorkflowInstances.AnyAsync(
            i => i.WorkflowDefinitionId == definitionId &&
                 i.Status == WorkflowInstanceStatus.Active, ct);
}
