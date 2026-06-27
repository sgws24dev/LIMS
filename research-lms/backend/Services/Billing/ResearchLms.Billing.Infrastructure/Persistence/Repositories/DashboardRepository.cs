using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Infrastructure.Persistence.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly BillingDbContext _context;
    private readonly ITenantContext _tenantContext;

    public DashboardRepository(BillingDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<DashboardDefinition?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Set<DashboardDefinition>()
            .Include(d => d.Widgets)
            .FirstOrDefaultAsync(d => d.Id == id, ct);
    }

    public async Task<IReadOnlyList<DashboardDefinition>> GetAllAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _context.Set<DashboardDefinition>()
            .Include(d => d.Widgets)
            .Where(d => d.TenantId == tenantId)
            .ToListAsync(ct);
    }

    public async Task AddAsync(DashboardDefinition dashboard, CancellationToken ct = default)
    {
        await _context.Set<DashboardDefinition>().AddAsync(dashboard, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(DashboardDefinition dashboard, CancellationToken ct = default)
    {
        _context.Set<DashboardDefinition>().Update(dashboard);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(DashboardDefinition dashboard, CancellationToken ct = default)
    {
        _context.Set<DashboardDefinition>().Remove(dashboard);
        await _context.SaveChangesAsync(ct);
    }
}
