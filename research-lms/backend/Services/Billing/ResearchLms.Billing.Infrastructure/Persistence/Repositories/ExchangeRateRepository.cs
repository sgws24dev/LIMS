using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Persistence.Repositories;

public class ExchangeRateRepository : IExchangeRateRepository
{
    private readonly BillingDbContext _context;

    public ExchangeRateRepository(BillingDbContext context)
    {
        _context = context;
    }

    public async Task<ExchangeRate?> GetCurrentRateAsync(string fromCurrency, string toCurrency, CancellationToken ct = default)
    {
        return await _context.ExchangeRates
            .Where(r => r.FromCurrency == fromCurrency.ToUpperInvariant())
            .Where(r => r.ToCurrency == toCurrency.ToUpperInvariant())
            .Where(r => r.ValidFrom <= DateTime.UtcNow)
            .Where(r => r.ValidTo == null || r.ValidTo >= DateTime.UtcNow)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<ExchangeRate>> GetAllAsync(string? fromCurrency = null, string? toCurrency = null, CancellationToken ct = default)
    {
        var query = _context.ExchangeRates.AsQueryable();
        if (!string.IsNullOrWhiteSpace(fromCurrency))
            query = query.Where(r => r.FromCurrency == fromCurrency.ToUpperInvariant());
        if (!string.IsNullOrWhiteSpace(toCurrency))
            query = query.Where(r => r.ToCurrency == toCurrency.ToUpperInvariant());
        return await query.OrderBy(r => r.FromCurrency).ThenBy(r => r.ToCurrency).ToListAsync(ct);
    }

    public async Task AddAsync(ExchangeRate rate, CancellationToken ct = default)
    {
        await _context.ExchangeRates.AddAsync(rate, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ExchangeRate rate, CancellationToken ct = default)
    {
        _context.ExchangeRates.Update(rate);
        await _context.SaveChangesAsync(ct);
    }
}
