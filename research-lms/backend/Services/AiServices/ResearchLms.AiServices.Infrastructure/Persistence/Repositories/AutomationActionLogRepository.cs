using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class AutomationActionLogRepository : IAutomationActionLogRepository
{
    private readonly AiServicesDbContext _context;

    public AutomationActionLogRepository(AiServicesDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<AutomationActionLog>> GetPendingByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _context.Set<AutomationActionLog>()
            .Where(l => l.TenantId == tenantId && l.Status == "Pending")
            .OrderByDescending(l => l.ExecutedAt)
            .ToListAsync(ct);
    }

    public async Task<AutomationActionLog?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Set<AutomationActionLog>().FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(AutomationActionLog log, CancellationToken ct = default)
    {
        await _context.Set<AutomationActionLog>().AddAsync(log, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(AutomationActionLog log, CancellationToken ct = default)
    {
        _context.Set<AutomationActionLog>().Update(log);
        await _context.SaveChangesAsync(ct);
    }
}
