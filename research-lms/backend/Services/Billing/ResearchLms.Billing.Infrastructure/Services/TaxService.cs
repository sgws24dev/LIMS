using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Services;

public class TaxService : ITaxService
{
    private readonly BillingDbContext _context;

    public TaxService(BillingDbContext context)
    {
        _context = context;
    }

    public async Task<decimal> CalculateTaxAsync(string country, string? region, decimal amount, CancellationToken ct = default)
    {
        var taxCodes = await GetApplicableTaxCodesAsync(country, region, ct);
        var totalTax = 0m;

        foreach (var taxCode in taxCodes)
        {
            var taxAmount = amount * taxCode.Rate;
            totalTax += taxAmount;

            if (taxCode.IsCompound)
            {
                amount += taxAmount;
            }
        }

        return Math.Round(totalTax, 2);
    }

    public async Task<IReadOnlyList<TaxCode>> GetApplicableTaxCodesAsync(string country, string? region, CancellationToken ct = default)
    {
        var query = _context.TaxCodes
            .Where(t => t.Country == country)
            .Where(t => t.EffectiveFrom <= DateTime.UtcNow)
            .Where(t => t.EffectiveTo == null || t.EffectiveTo >= DateTime.UtcNow);

        if (!string.IsNullOrWhiteSpace(region))
        {
            query = query.Where(t => t.Region == null || t.Region == region);
        }

        var results = await query.ToListAsync(ct);

        if (results.Count == 0)
        {
            results = await _context.TaxCodes
                .Where(t => t.IsDefault)
                .Where(t => t.EffectiveFrom <= DateTime.UtcNow)
                .Where(t => t.EffectiveTo == null || t.EffectiveTo >= DateTime.UtcNow)
                .ToListAsync(ct);
        }

        return results;
    }
}
