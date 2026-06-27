using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.Pricing;

public class CreatePricingModelCommandHandler : IRequestHandler<CreatePricingModelCommand, PricingModelDto>
{
    private readonly IPricingModelRepository _repository;

    public CreatePricingModelCommandHandler(IPricingModelRepository repository)
    {
        _repository = repository;
    }

    public async Task<PricingModelDto> Handle(CreatePricingModelCommand request, CancellationToken ct)
    {
        if (!Enum.TryParse<PricingModelType>(request.ModelType, true, out var modelType))
            throw new ArgumentException($"Invalid pricing model type: {request.ModelType}");

        var entity = new PricingModel(
            request.Name,
            request.Description,
            modelType,
            request.EffectiveFrom,
            request.EffectiveTo,
            "system");

        await _repository.AddAsync(entity, ct);

        return new PricingModelDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            ModelType = entity.ModelType.ToString(),
            EffectiveFrom = entity.EffectiveFrom,
            EffectiveTo = entity.EffectiveTo,
            IsActive = entity.IsActive,
        };
    }
}
