using MediatR;
using ResearchLms.Facilities.Application.Mappings;
using ResearchLms.Facilities.Domain.Events;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public class CreateAssetCommandHandler : IRequestHandler<CreateAssetCommand, Result<Guid>>
{
    private readonly IAssetRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly IPublisher _publisher;

    public CreateAssetCommandHandler(IAssetRepository repository, ITenantContext tenantContext, IPublisher publisher)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _publisher = publisher;
    }

    public async Task<Result<Guid>> Handle(CreateAssetCommand request, CancellationToken ct)
    {
        var assetType = request.Data.Category == "Instruments" ? "Instrument" : "Equipment";
        var asset = AssetMapping.ToEntity(request.Data, assetType);

        await _repository.AddAsync(asset, ct);

        await _publisher.Publish(new AssetCreatedEvent(asset.Id, asset.TenantId), ct);

        return Result.Success(asset.Id);
    }
}
