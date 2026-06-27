using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Pricing;

public class CalculatePriceQueryHandler : IRequestHandler<CalculatePriceQuery, PriceBreakdownDto>
{
    private readonly IPricingService _pricingService;

    public CalculatePriceQueryHandler(IPricingService pricingService)
    {
        _pricingService = pricingService;
    }

    public async Task<PriceBreakdownDto> Handle(CalculatePriceQuery request, CancellationToken ct)
    {
        var result = await _pricingService.CalculatePriceAsync(
            request.PricingModelId,
            request.Quantity,
            request.Duration,
            request.CustomerType,
            request.Context,
            ct);

        return new PriceBreakdownDto
        {
            Subtotal = result.Subtotal,
            DiscountAmount = result.DiscountAmount,
            TaxAmount = result.TaxAmount,
            Total = result.Total,
            LineItems = result.LineItems.Select(li => new PriceLineItemDto
            {
                Description = li.Description,
                Quantity = li.Quantity,
                UnitPrice = li.UnitPrice,
                DiscountPercent = li.DiscountPercent,
                TaxRate = li.TaxRate,
                LineTotal = li.LineTotal,
            }).ToList()
        };
    }
}
