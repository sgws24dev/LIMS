using Microsoft.EntityFrameworkCore;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Infrastructure.Persistence;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Repositories;

public class NotificationRuleRepository : INotificationRuleRepository
{
    private readonly ServiceWorkflowDbContext _context;

    public NotificationRuleRepository(ServiceWorkflowDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationRule?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.NotificationRules.FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IReadOnlyList<NotificationRule>> GetByDefinitionIdAsync(Guid definitionId, CancellationToken ct = default)
        => await _context.NotificationRules
            .Where(r => r.WorkflowDefinitionId == definitionId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(NotificationRule rule, CancellationToken ct = default)
    {
        await _context.NotificationRules.AddAsync(rule, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(NotificationRule rule, CancellationToken ct = default)
    {
        _context.NotificationRules.Update(rule);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(NotificationRule rule, CancellationToken ct = default)
    {
        _context.NotificationRules.Remove(rule);
        await _context.SaveChangesAsync(ct);
    }
}
