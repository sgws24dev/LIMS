using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Persistence.Repositories;

public class RateTableRepository : IRateTableRepository
{
    private readonly BillingDbContext _context;

    public RateTableRepository(BillingDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<RateTable>> GetByPricingModelIdAsync(Guid pricingModelId, CancellationToken ct = default)
    {
        return await _context.RateTables
            .Where(r => r.PricingModelId == pricingModelId)
            .ToListAsync(ct);
    }

    public async Task<RateTable?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.RateTables.FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(RateTable rateTable, CancellationToken ct = default)
    {
        await _context.RateTables.AddAsync(rateTable, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(RateTable rateTable, CancellationToken ct = default)
    {
        _context.RateTables.Update(rateTable);
        await _context.SaveChangesAsync(ct);
    }
}
