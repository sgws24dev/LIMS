using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Commands.Pricing;

public record UpdatePricingModelCommand(
    Guid Id,
    string Name,
    string? Description,
    string ModelType,
    DateTime EffectiveFrom,
    DateTime? EffectiveTo
) : IRequest<PricingModelDto>;
