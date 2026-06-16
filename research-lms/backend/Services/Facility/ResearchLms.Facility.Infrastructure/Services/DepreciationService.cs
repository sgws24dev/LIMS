using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain.Entities;
using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Facilities.Infrastructure.Services;

public class DepreciationService : IDepreciationService
{
    public decimal CalculateStraightLine(decimal cost, decimal salvage, int usefulLifeYears, int elapsedYears)
    {
        var annualDepreciation = (cost - salvage) / usefulLifeYears;
        var currentValue = cost - (annualDepreciation * elapsedYears);
        return Math.Max(currentValue, salvage);
    }

    public decimal CalculateDecliningBalance(decimal cost, decimal salvage, int usefulLifeYears, int elapsedYears)
    {
        var rate = 2.0m / usefulLifeYears;
        var currentValue = cost * (decimal)Math.Pow((double)(1 - rate), elapsedYears);
        return Math.Max(currentValue, salvage);
    }

    public IEnumerable<DepreciationScheduleEntry> GenerateSchedule(Asset asset)
    {
        if (asset.AcquisitionDate is null || !asset.UsefulLifeYears.HasValue || asset.AcquisitionCost is null)
            yield break;

        var cost = asset.AcquisitionCost.Value;
        var salvage = asset.SalvageValue ?? 0;
        var usefulLife = asset.UsefulLifeYears.Value;
        var acquisitionDate = asset.AcquisitionDate.Value;
        var method = asset.DepreciationMethod ?? DepreciationMethod.StraightLine;

        for (int year = 1; year <= usefulLife; year++)
        {
            var bookValue = method == DepreciationMethod.DecliningBalance
                ? CalculateDecliningBalance(cost, salvage, usefulLife, year)
                : CalculateStraightLine(cost, salvage, usefulLife, year);

            var prevValue = year == 1
                ? cost
                : (method == DepreciationMethod.DecliningBalance
                    ? CalculateDecliningBalance(cost, salvage, usefulLife, year - 1)
                    : CalculateStraightLine(cost, salvage, usefulLife, year - 1));

            var depreciationAmount = prevValue - bookValue;
            var periodEnd = acquisitionDate.AddYears(year);

            yield return new DepreciationScheduleEntry(year, bookValue, depreciationAmount, periodEnd);
        }
    }
}
