using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Pricing;

public class GetTaxCodesQueryHandler : IRequestHandler<GetTaxCodesQuery, IReadOnlyList<TaxCodeDto>>
{
    private readonly ITaxService _taxService;

    public GetTaxCodesQueryHandler(ITaxService taxService)
    {
        _taxService = taxService;
    }

    public async Task<IReadOnlyList<TaxCodeDto>> Handle(GetTaxCodesQuery request, CancellationToken ct)
    {
        var entities = await _taxService.GetApplicableTaxCodesAsync(request.Country ?? "", null, ct);

        return entities
            .OrderBy(t => t.Country)
            .ThenBy(t => t.Name)
            .Select(e => new TaxCodeDto
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description,
                Country = e.Country,
                Region = e.Region,
                Rate = e.Rate,
                IsDefault = e.IsDefault,
                IsCompound = e.IsCompound,
                EffectiveFrom = e.EffectiveFrom,
                EffectiveTo = e.EffectiveTo,
            }).ToList();
    }
}
