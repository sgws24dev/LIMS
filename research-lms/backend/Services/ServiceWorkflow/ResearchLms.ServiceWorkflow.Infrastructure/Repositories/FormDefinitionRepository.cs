using Microsoft.EntityFrameworkCore;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Infrastructure.Persistence;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Repositories;

public class FormDefinitionRepository : IFormDefinitionRepository
{
    private readonly ServiceWorkflowDbContext _context;

    public FormDefinitionRepository(ServiceWorkflowDbContext context)
    {
        _context = context;
    }

    public async Task<FormDefinition?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.FormDefinitions.FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<IReadOnlyList<FormDefinition>> GetAllAsync(Guid tenantId, CancellationToken ct = default)
        => await _context.FormDefinitions
            .Where(e => e.TenantId == tenantId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<FormDefinition>> GetPublishedAsync(Guid tenantId, CancellationToken ct = default)
        => await _context.FormDefinitions
            .Where(e => e.TenantId == tenantId && e.Status == FormStatus.Published)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(FormDefinition form, CancellationToken ct = default)
    {
        await _context.FormDefinitions.AddAsync(form, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(FormDefinition form, CancellationToken ct = default)
    {
        _context.FormDefinitions.Update(form);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(FormDefinition form, CancellationToken ct = default)
    {
        _context.FormDefinitions.Remove(form);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<bool> HasActiveRequestsAsync(Guid formDefinitionId, CancellationToken ct = default)
        => await _context.ServiceRequests.AnyAsync(
            e => e.FormDefinitionId == formDefinitionId &&
                 e.Status != ServiceRequestStatus.Completed &&
                 e.Status != ServiceRequestStatus.Cancelled &&
                 e.Status != ServiceRequestStatus.Rejected, ct);
}
