using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface ICurrencyService
{
    Task<decimal> ConvertAsync(decimal amount, string fromCurrency, string toCurrency, CancellationToken ct = default);
    Task<IReadOnlyList<ExchangeRate>> GetRatesAsync(string? fromCurrency = null, string? toCurrency = null, CancellationToken ct = default);
}
