using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Services;

public class RebateService : IRebateService
{
    private readonly BillingDbContext _context;

    public RebateService(BillingDbContext context)
    {
        _context = context;
    }

    public async Task<decimal> CalculateRebateAsync(decimal subtotal, string? rebateCode = null, CancellationToken ct = default)
    {
        var rebates = await GetApplicableRebatesAsync(subtotal, ct);
        var totalDiscount = 0m;

        foreach (var rebate in rebates)
        {
            var discount = rebate.RebateType switch
            {
                Domain.Entities.RebateType.Percentage => subtotal * rebate.Value / 100,
                Domain.Entities.RebateType.Fixed => rebate.Value,
                Domain.Entities.RebateType.Volume => subtotal * rebate.Value / 100,
                _ => 0
            };

            if (rebate.MaxDiscountAmount.HasValue)
                discount = Math.Min(discount, rebate.MaxDiscountAmount.Value);

            totalDiscount += discount;
        }

        return Math.Round(totalDiscount, 2);
    }

    public async Task<IReadOnlyList<Rebate>> GetApplicableRebatesAsync(decimal subtotal, CancellationToken ct = default)
    {
        var query = _context.Rebates
            .Where(r => r.IsActive)
            .Where(r => r.ValidFrom <= DateTime.UtcNow)
            .Where(r => r.ValidTo == null || r.ValidTo >= DateTime.UtcNow)
            .Where(r => r.MinSpendAmount == null || r.MinSpendAmount <= subtotal);

        return await query.ToListAsync(ct);
    }
}
