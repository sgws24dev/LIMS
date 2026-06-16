using Microsoft.EntityFrameworkCore;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Infrastructure.Persistence;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Repositories;

public class MilestoneRepository : IMilestoneRepository
{
    private readonly ServiceWorkflowDbContext _context;

    public MilestoneRepository(ServiceWorkflowDbContext context)
    {
        _context = context;
    }

    public async Task<RequestMilestone?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.RequestMilestones.FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<IReadOnlyList<RequestMilestone>> GetByRequestIdAsync(Guid serviceRequestId, CancellationToken ct = default)
        => await _context.RequestMilestones
            .Where(e => e.ServiceRequestId == serviceRequestId)
            .OrderBy(e => e.Order)
            .ToListAsync(ct);

    public async Task AddAsync(RequestMilestone milestone, CancellationToken ct = default)
    {
        await _context.RequestMilestones.AddAsync(milestone, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(RequestMilestone milestone, CancellationToken ct = default)
    {
        _context.RequestMilestones.Update(milestone);
        await _context.SaveChangesAsync(ct);
    }
}
