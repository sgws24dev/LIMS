using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public class GetDepreciationScheduleQueryHandler
    : IRequestHandler<GetDepreciationScheduleQuery, Result<IEnumerable<DepreciationScheduleEntry>>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IDepreciationService _depreciationService;

    public GetDepreciationScheduleQueryHandler(
        IAssetRepository assetRepository, IDepreciationService depreciationService)
    {
        _assetRepository = assetRepository;
        _depreciationService = depreciationService;
    }

    public async Task<Result<IEnumerable<DepreciationScheduleEntry>>> Handle(
        GetDepreciationScheduleQuery request, CancellationToken ct)
    {
        var asset = await _assetRepository.GetByIdAsync(request.AssetId, ct);
        if (asset is null)
            return Result.Failure<IEnumerable<DepreciationScheduleEntry>>("NOT_FOUND", "Asset not found.");

        var schedule = _depreciationService.GenerateSchedule(asset);
        return Result.Success(schedule);
    }
}
