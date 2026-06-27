using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class ActionLogRepository : IActionLogRepository
{
    private readonly AiServicesDbContext _context;

    public ActionLogRepository(AiServicesDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ActionLog>> GetByTenantAsync(Guid tenantId, Guid? userId = null, CancellationToken ct = default)
    {
        var query = _context.ActionLogs.Where(e => e.TenantId == tenantId);
        if (userId.HasValue)
            query = query.Where(e => e.UserId == userId.Value);
        return await query.OrderByDescending(e => e.CreatedAt).ToListAsync(ct);
    }

    public async Task<ActionLog?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.ActionLogs.FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(ActionLog log, CancellationToken ct = default)
    {
        await _context.ActionLogs.AddAsync(log, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ActionLog log, CancellationToken ct = default)
    {
        _context.ActionLogs.Update(log);
        await _context.SaveChangesAsync(ct);
    }
}
