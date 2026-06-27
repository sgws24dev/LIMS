using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class IoTRuleRepository : IIoTRuleRepository
{
    private readonly AiServicesDbContext _context;

    public IoTRuleRepository(AiServicesDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<IoTRule>> GetByTenantAsync(Guid tenantId, Guid? instrumentId = null, CancellationToken ct = default)
    {
        var query = _context.Set<IoTRule>().Where(r => r.TenantId == tenantId);
        if (instrumentId.HasValue)
            query = query.Where(r => r.InstrumentId == instrumentId.Value);
        return await query.ToListAsync(ct);
    }

    public async Task<IoTRule?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Set<IoTRule>().FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(IoTRule rule, CancellationToken ct = default)
    {
        await _context.Set<IoTRule>().AddAsync(rule, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(IoTRule rule, CancellationToken ct = default)
    {
        _context.Set<IoTRule>().Update(rule);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(IoTRule rule, CancellationToken ct = default)
    {
        _context.Set<IoTRule>().Remove(rule);
        await _context.SaveChangesAsync(ct);
    }
}
