using MediatR;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Facilities.Domain.Events;
using ResearchLms.Facilities.Domain.Interfaces;

namespace ResearchLms.Facilities.Application.EventHandlers;

public class AssetCreatedEventHandler : INotificationHandler<AssetCreatedEvent>
{
    private readonly IAssetRepository _repository;
    private readonly IAssetSearchService _searchService;

    public AssetCreatedEventHandler(IAssetRepository repository, IAssetSearchService searchService)
    {
        _repository = repository;
        _searchService = searchService;
    }

    public async Task Handle(AssetCreatedEvent notification, CancellationToken ct)
    {
        var asset = await _repository.GetByIdAsync(notification.AssetId, ct);
        if (asset is not null)
            await _searchService.IndexAsync(asset, ct);
    }
}

public class AssetUpdatedEventHandler : INotificationHandler<AssetUpdatedEvent>
{
    private readonly IAssetRepository _repository;
    private readonly IAssetSearchService _searchService;

    public AssetUpdatedEventHandler(IAssetRepository repository, IAssetSearchService searchService)
    {
        _repository = repository;
        _searchService = searchService;
    }

    public async Task Handle(AssetUpdatedEvent notification, CancellationToken ct)
    {
        var asset = await _repository.GetByIdAsync(notification.AssetId, ct);
        if (asset is not null)
            await _searchService.IndexAsync(asset, ct);
    }
}
