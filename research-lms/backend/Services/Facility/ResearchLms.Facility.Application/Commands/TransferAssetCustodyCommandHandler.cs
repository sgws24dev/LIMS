using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;
using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Facilities.Application.Commands;

public class TransferAssetCustodyCommandHandler : IRequestHandler<TransferAssetCustodyCommand, Result<Guid>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly ICustodyRepository _custodyRepository;

    public TransferAssetCustodyCommandHandler(
        IAssetRepository assetRepository,
        ICustodyRepository custodyRepository)
    {
        _assetRepository = assetRepository;
        _custodyRepository = custodyRepository;
    }

    public async Task<Result<Guid>> Handle(TransferAssetCustodyCommand request, CancellationToken ct)
    {
        var asset = await _assetRepository.GetByIdAsync(request.Data.AssetId, ct);
        if (asset is null)
            return Result.Failure<Guid>("Asset not found");

        if (asset.Status == AssetStatus.Decommissioned || asset.Status == AssetStatus.Disposed)
            return Result.Failure<Guid>("Cannot transfer custody of a decommissioned or disposed asset");

        var currentEvent = await _custodyRepository.GetCurrentCustodianAsync(request.Data.AssetId, ct);
        var fromUserId = currentEvent?.ToUserId;
        var fromUserName = currentEvent?.ToUserName;
        var fromLocation = currentEvent?.ToLocation ?? asset.Location;

        var custodyEvent = new CustodyEvent(
            request.Data.AssetId,
            fromUserId,
            request.Data.ToUserId,
            fromUserName,
            request.Data.ToUserName,
            fromLocation,
            request.Data.ToLocation,
            request.Data.Reason,
            request.Data.SignatureData,
            request.Data.Notes);

        asset.AddCustodyEvent(custodyEvent);
        asset.UpdateLocation(request.Data.ToLocation);

        await _custodyRepository.AddAsync(custodyEvent, ct);

        return Result.Success(custodyEvent.Id);
    }
}
