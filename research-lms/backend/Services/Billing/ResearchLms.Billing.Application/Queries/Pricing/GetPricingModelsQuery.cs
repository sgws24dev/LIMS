using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Queries.Pricing;

public record GetPricingModelsQuery(bool? IsActive = null) : IRequest<IReadOnlyList<PricingModelDto>>;
