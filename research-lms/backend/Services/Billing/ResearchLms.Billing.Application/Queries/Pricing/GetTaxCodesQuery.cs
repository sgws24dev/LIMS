using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Queries.Pricing;

public record GetTaxCodesQuery(string? Country = null) : IRequest<IReadOnlyList<TaxCodeDto>>;
