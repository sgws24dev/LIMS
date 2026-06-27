using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Persistence.Repositories;

public class PricingModelRepository : IPricingModelRepository
{
    private readonly BillingDbContext _context;

    public PricingModelRepository(BillingDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<PricingModel>> GetAllAsync(bool? isActive = null, CancellationToken ct = default)
    {
        var query = _context.PricingModels
            .Include(p => p.RateTables)
            .AsQueryable();

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        return await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<PricingModel?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.PricingModels
            .Include(p => p.RateTables)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public async Task AddAsync(PricingModel pricingModel, CancellationToken ct = default)
    {
        await _context.PricingModels.AddAsync(pricingModel, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(PricingModel pricingModel, CancellationToken ct = default)
    {
        _context.PricingModels.Update(pricingModel);
        await _context.SaveChangesAsync(ct);
    }
}
