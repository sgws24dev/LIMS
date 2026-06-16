using Microsoft.EntityFrameworkCore;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Infrastructure.Persistence;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Repositories;

public class ApprovalRepository : IApprovalRepository
{
    private readonly ServiceWorkflowDbContext _context;

    public ApprovalRepository(ServiceWorkflowDbContext context)
    {
        _context = context;
    }

    public async Task<Approval?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Approvals.FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<IReadOnlyList<Approval>> GetByRequestIdAsync(Guid serviceRequestId, CancellationToken ct = default)
        => await _context.Approvals
            .Where(e => e.ServiceRequestId == serviceRequestId)
            .OrderBy(e => e.StepOrder)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Approval>> GetPendingForUserAsync(string userId, CancellationToken ct = default)
        => await _context.Approvals
            .Where(e => e.ApproverUserId == userId && e.Status == ApprovalStatus.Pending)
            .OrderBy(e => e.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(Approval approval, CancellationToken ct = default)
    {
        await _context.Approvals.AddAsync(approval, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Approval approval, CancellationToken ct = default)
    {
        _context.Approvals.Update(approval);
        await _context.SaveChangesAsync(ct);
    }
}
