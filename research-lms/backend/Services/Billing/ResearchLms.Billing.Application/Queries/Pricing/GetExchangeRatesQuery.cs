using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Pricing;

public record GetExchangeRatesQuery(string? FromCurrency, string? ToCurrency) : IRequest<IReadOnlyList<ExchangeRateDto>>;

public class GetExchangeRatesQueryHandler : IRequestHandler<GetExchangeRatesQuery, IReadOnlyList<ExchangeRateDto>>
{
    private readonly ICurrencyService _currencyService;

    public GetExchangeRatesQueryHandler(ICurrencyService currencyService)
    {
        _currencyService = currencyService;
    }

    public async Task<IReadOnlyList<ExchangeRateDto>> Handle(GetExchangeRatesQuery request, CancellationToken ct)
    {
        var rates = await _currencyService.GetRatesAsync(request.FromCurrency, request.ToCurrency, ct);
        return rates.Select(r => new ExchangeRateDto
        {
            Id = r.Id,
            FromCurrency = r.FromCurrency,
            ToCurrency = r.ToCurrency,
            Rate = r.Rate,
            ValidFrom = r.ValidFrom,
            ValidTo = r.ValidTo,
        }).ToList();
    }
}
