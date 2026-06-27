using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IExchangeRateRepository
{
    Task<ExchangeRate?> GetCurrentRateAsync(string fromCurrency, string toCurrency, CancellationToken ct = default);
    Task<IReadOnlyList<ExchangeRate>> GetAllAsync(string? fromCurrency = null, string? toCurrency = null, CancellationToken ct = default);
    Task AddAsync(ExchangeRate rate, CancellationToken ct = default);
    Task UpdateAsync(ExchangeRate rate, CancellationToken ct = default);
}
