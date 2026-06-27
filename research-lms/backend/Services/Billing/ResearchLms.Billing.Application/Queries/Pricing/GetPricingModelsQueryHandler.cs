using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Pricing;

public class GetPricingModelsQueryHandler : IRequestHandler<GetPricingModelsQuery, IReadOnlyList<PricingModelDto>>
{
    private readonly IPricingModelRepository _repository;

    public GetPricingModelsQueryHandler(IPricingModelRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<PricingModelDto>> Handle(GetPricingModelsQuery request, CancellationToken ct)
    {
        var entities = await _repository.GetAllAsync(request.IsActive, ct);

        return entities.Select(e => new PricingModelDto
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            ModelType = e.ModelType.ToString(),
            EffectiveFrom = e.EffectiveFrom,
            EffectiveTo = e.EffectiveTo,
            IsActive = e.IsActive,
            RateTables = e.RateTables.Select(r => new RateTableDto
            {
                Id = r.Id,
                CustomerType = r.CustomerType.ToString(),
                Rate = r.Rate,
                MinQuantity = r.MinQuantity,
                MaxQuantity = r.MaxQuantity,
                EffectiveFrom = r.EffectiveFrom,
                EffectiveTo = r.EffectiveTo,
            }).ToList()
        }).ToList();
    }
}
