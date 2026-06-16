using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Facilities.Infrastructure.Jobs;

public class DepreciationRecalculationJob : IDepreciationRecalculationJob
{
    private readonly IAssetRepository _assetRepository;
    private readonly IDepreciationService _depreciationService;

    public DepreciationRecalculationJob(
        IAssetRepository assetRepository,
        IDepreciationService depreciationService)
    {
        _assetRepository = assetRepository;
        _depreciationService = depreciationService;
    }

    public async Task ExecuteAsync()
    {
        var assets = await _assetRepository.GetActiveAssetsForDepreciationAsync();

        foreach (var asset in assets)
        {
            if (asset.AcquisitionDate is null || !asset.UsefulLifeYears.HasValue || asset.AcquisitionCost is null)
                continue;

            var elapsedYears = DateTime.UtcNow.Year - asset.AcquisitionDate.Value.Year;
            if (elapsedYears < 0) elapsedYears = 0;

            var currentValue = asset.DepreciationMethod == DepreciationMethod.DecliningBalance
                ? _depreciationService.CalculateDecliningBalance(
                    asset.AcquisitionCost.Value, asset.SalvageValue ?? 0,
                    asset.UsefulLifeYears.Value, elapsedYears)
                : _depreciationService.CalculateStraightLine(
                    asset.AcquisitionCost.Value, asset.SalvageValue ?? 0,
                    asset.UsefulLifeYears.Value, elapsedYears);

            asset.UpdateCurrentValue(currentValue);
            await _assetRepository.UpdateAsync(asset);
        }
    }
}
