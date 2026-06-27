using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Commands.Pricing;

public record CreatePricingModelCommand(
    string Name,
    string? Description,
    string ModelType,
    DateTime EffectiveFrom,
    DateTime? EffectiveTo
) : IRequest<PricingModelDto>;
