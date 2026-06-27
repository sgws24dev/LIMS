using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Commands.Pricing;

public record SetRateTableCommand(
    Guid PricingModelId,
    string CustomerType,
    decimal Rate,
    decimal? MinQuantity,
    decimal? MaxQuantity,
    DateTime EffectiveFrom,
    DateTime? EffectiveTo
) : IRequest<RateTableDto>;
