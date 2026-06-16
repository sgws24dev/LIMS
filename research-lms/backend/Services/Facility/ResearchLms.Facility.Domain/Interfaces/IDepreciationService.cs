using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Domain.Interfaces;

public record DepreciationScheduleEntry(int Year, decimal BookValue, decimal DepreciationAmount, DateOnly PeriodEnd);

public interface IDepreciationService
{
    decimal CalculateStraightLine(decimal cost, decimal salvage, int usefulLifeYears, int elapsedYears);
    decimal CalculateDecliningBalance(decimal cost, decimal salvage, int usefulLifeYears, int elapsedYears);
    IEnumerable<DepreciationScheduleEntry> GenerateSchedule(Asset asset);
}
