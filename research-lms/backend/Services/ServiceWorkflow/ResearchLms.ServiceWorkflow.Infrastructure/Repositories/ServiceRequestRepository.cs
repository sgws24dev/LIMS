using Microsoft.EntityFrameworkCore;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Infrastructure.Persistence;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Repositories;

public class ServiceRequestRepository : IServiceRequestRepository
{
    private readonly ServiceWorkflowDbContext _context;

    public ServiceRequestRepository(ServiceWorkflowDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceRequest?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.ServiceRequests
            .Include(e => e.Milestones)
            .Include(e => e.Approvals)
            .Include(e => e.StatusHistory)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<IReadOnlyList<ServiceRequest>> GetAllAsync(Guid tenantId, CancellationToken ct = default)
        => await _context.ServiceRequests
            .Where(e => e.TenantId == tenantId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<ServiceRequest>> GetByFormDefinitionIdAsync(Guid formDefinitionId, CancellationToken ct = default)
        => await _context.ServiceRequests
            .Where(e => e.FormDefinitionId == formDefinitionId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<ServiceRequest>> GetByAssigneeAsync(string userId, CancellationToken ct = default)
        => await _context.ServiceRequests
            .Where(e => e.AssignedTo == userId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<ServiceRequest>> GetBySubmitterAsync(string userId, CancellationToken ct = default)
        => await _context.ServiceRequests
            .Where(e => e.CreatedBy == userId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(ServiceRequest request, CancellationToken ct = default)
    {
        await _context.ServiceRequests.AddAsync(request, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ServiceRequest request, CancellationToken ct = default)
    {
        _context.ServiceRequests.Update(request);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<int> GetActiveRequestCountAsync(Guid formDefinitionId, CancellationToken ct = default)
        => await _context.ServiceRequests.CountAsync(
            e => e.FormDefinitionId == formDefinitionId &&
                 e.Status != Domain.Enums.ServiceRequestStatus.Completed &&
                 e.Status != Domain.Enums.ServiceRequestStatus.Cancelled &&
                 e.Status != Domain.Enums.ServiceRequestStatus.Rejected, ct);
}
