using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class AutomationRuleRepository : IAutomationRuleRepository
{
    private readonly AiServicesDbContext _context;

    public AutomationRuleRepository(AiServicesDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<AutomationRule>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _context.Set<AutomationRule>().Where(r => r.TenantId == tenantId).ToListAsync(ct);
    }

    public async Task<AutomationRule?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Set<AutomationRule>().FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(AutomationRule rule, CancellationToken ct = default)
    {
        await _context.Set<AutomationRule>().AddAsync(rule, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(AutomationRule rule, CancellationToken ct = default)
    {
        _context.Set<AutomationRule>().Update(rule);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(AutomationRule rule, CancellationToken ct = default)
    {
        _context.Set<AutomationRule>().Remove(rule);
        await _context.SaveChangesAsync(ct);
    }
}
