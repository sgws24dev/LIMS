using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class IoTAlertRepository : IIoTAlertRepository
{
    private readonly AiServicesDbContext _context;

    public IoTAlertRepository(AiServicesDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<IoTAlert>> GetByTenantAsync(Guid tenantId, Guid? instrumentId = null, Guid? ruleId = null,
        string? status = null, CancellationToken ct = default)
    {
        var query = _context.Set<IoTAlert>().Where(a => a.TenantId == tenantId);

        if (instrumentId.HasValue)
            query = query.Where(a => a.InstrumentId == instrumentId.Value);
        if (ruleId.HasValue)
            query = query.Where(a => a.RuleId == ruleId.Value);
        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status.ToString() == status);

        return await query.OrderByDescending(a => a.OpenedAt).ToListAsync(ct);
    }

    public async Task<IoTAlert?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Set<IoTAlert>().FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(IoTAlert alert, CancellationToken ct = default)
    {
        await _context.Set<IoTAlert>().AddAsync(alert, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(IoTAlert alert, CancellationToken ct = default)
    {
        _context.Set<IoTAlert>().Update(alert);
        await _context.SaveChangesAsync(ct);
    }
}
