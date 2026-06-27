using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.Pricing;

public class SetRateTableCommandHandler : IRequestHandler<SetRateTableCommand, RateTableDto>
{
    private readonly IRateTableRepository _repository;

    public SetRateTableCommandHandler(IRateTableRepository repository)
    {
        _repository = repository;
    }

    public async Task<RateTableDto> Handle(SetRateTableCommand request, CancellationToken ct)
    {
        if (!Enum.TryParse<CustomerType>(request.CustomerType, true, out var customerType))
            throw new ArgumentException($"Invalid customer type: {request.CustomerType}");

        var entity = new RateTable(
            request.PricingModelId,
            customerType,
            request.Rate,
            request.MinQuantity,
            request.MaxQuantity,
            request.EffectiveFrom,
            request.EffectiveTo,
            "system");

        await _repository.AddAsync(entity, ct);

        return new RateTableDto
        {
            Id = entity.Id,
            CustomerType = entity.CustomerType.ToString(),
            Rate = entity.Rate,
            MinQuantity = entity.MinQuantity,
            MaxQuantity = entity.MaxQuantity,
            EffectiveFrom = entity.EffectiveFrom,
            EffectiveTo = entity.EffectiveTo,
        };
    }
}
