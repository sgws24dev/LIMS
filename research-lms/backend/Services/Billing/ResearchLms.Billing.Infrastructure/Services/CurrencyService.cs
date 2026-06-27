using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Infrastructure.Services;

public class CurrencyService : ICurrencyService
{
    private readonly IExchangeRateRepository _repository;

    public CurrencyService(IExchangeRateRepository repository)
    {
        _repository = repository;
    }

    public async Task<decimal> ConvertAsync(decimal amount, string fromCurrency, string toCurrency, CancellationToken ct = default)
    {
        if (fromCurrency.Equals(toCurrency, StringComparison.OrdinalIgnoreCase))
            return amount;

        var rate = await _repository.GetCurrentRateAsync(fromCurrency, toCurrency, ct);
        if (rate == null)
            throw new InvalidOperationException($"No exchange rate found for {fromCurrency} -> {toCurrency}");

        return Math.Round(amount * rate.Rate, 2);
    }

    public async Task<IReadOnlyList<ExchangeRate>> GetRatesAsync(string? fromCurrency = null, string? toCurrency = null, CancellationToken ct = default)
    {
        return await _repository.GetAllAsync(fromCurrency, toCurrency, ct);
    }
}
