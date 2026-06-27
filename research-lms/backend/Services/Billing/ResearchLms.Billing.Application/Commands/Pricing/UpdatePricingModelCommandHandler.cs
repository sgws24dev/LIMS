using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.Pricing;

public class UpdatePricingModelCommandHandler : IRequestHandler<UpdatePricingModelCommand, PricingModelDto>
{
    private readonly IPricingModelRepository _repository;

    public UpdatePricingModelCommandHandler(IPricingModelRepository repository)
    {
        _repository = repository;
    }

    public async Task<PricingModelDto> Handle(UpdatePricingModelCommand request, CancellationToken ct)
    {
        var entity = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Pricing model {request.Id} not found.");

        if (!Enum.TryParse<PricingModelType>(request.ModelType, true, out var modelType))
            throw new ArgumentException($"Invalid pricing model type: {request.ModelType}");

        entity.Update(request.Name, request.Description, modelType, request.EffectiveFrom, request.EffectiveTo, "system");
        await _repository.UpdateAsync(entity, ct);

        return new PricingModelDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            ModelType = entity.ModelType.ToString(),
            EffectiveFrom = entity.EffectiveFrom,
            EffectiveTo = entity.EffectiveTo,
            IsActive = entity.IsActive,
            RateTables = entity.RateTables.Select(r => new RateTableDto
            {
                Id = r.Id,
                CustomerType = r.CustomerType.ToString(),
                Rate = r.Rate,
                MinQuantity = r.MinQuantity,
                MaxQuantity = r.MaxQuantity,
                EffectiveFrom = r.EffectiveFrom,
                EffectiveTo = r.EffectiveTo,
            }).ToList()
        };
    }
}
