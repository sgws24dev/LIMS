using MediatR;
using ResearchLms.Facilities.Application.Mappings;
using ResearchLms.Facilities.Domain.Events;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public class UpdateAssetCommandHandler : IRequestHandler<UpdateAssetCommand, Result>
{
    private readonly IAssetRepository _repository;
    private readonly IPublisher _publisher;

    public UpdateAssetCommandHandler(IAssetRepository repository, IPublisher publisher)
    {
        _repository = repository;
        _publisher = publisher;
    }

    public async Task<Result> Handle(UpdateAssetCommand request, CancellationToken ct)
    {
        var asset = await _repository.GetByIdAsync(request.Id, ct);
        if (asset is null)
            return Result.Failure("NOT_FOUND", "Asset not found.");

        AssetMapping.ApplyUpdate(asset, request.Data);
        await _repository.UpdateAsync(asset, ct);

        await _publisher.Publish(new AssetUpdatedEvent(asset.Id, asset.TenantId), ct);

        return Result.Success();
    }
}
