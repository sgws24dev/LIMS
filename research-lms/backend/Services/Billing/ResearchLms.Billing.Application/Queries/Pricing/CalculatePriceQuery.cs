using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Queries.Pricing;

public record CalculatePriceQuery(
    Guid PricingModelId,
    decimal Quantity,
    int? Duration,
    string CustomerType,
    Dictionary<string, object>? Context = null
) : IRequest<PriceBreakdownDto>;
