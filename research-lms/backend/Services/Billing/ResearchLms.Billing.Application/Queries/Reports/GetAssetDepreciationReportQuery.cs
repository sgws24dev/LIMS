using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Queries.Reports;

public record GetAssetDepreciationReportQuery(
    DateTime? DateFrom, DateTime? DateTo,
    string? AssetCategory, string? DepreciationMethod
) : IRequest<AssetDepreciationReportDto>;

public record GetAssetValuationReportQuery : IRequest<AssetValuationReportDto>;

public class AssetDepreciationReportDto
{
    public decimal TotalAssetValue { get; set; }
    public decimal AccumulatedDepreciation { get; set; }
    public decimal NetBookValue { get; set; }
    public List<DepreciationByCategoryDto> ByCategory { get; set; } = new();
    public List<MonthlyDepreciationTrendDto> MonthlyTrends { get; set; } = new();
}

public class DepreciationByCategoryDto
{
    public string Category { get; set; } = string.Empty;
    public decimal TotalValue { get; set; }
    public decimal AccumulatedDepreciation { get; set; }
    public decimal NetBookValue { get; set; }
}

public class MonthlyDepreciationTrendDto
{
    public string Month { get; set; } = string.Empty;
    public decimal DepreciationAmount { get; set; }
}

public class AssetValuationReportDto
{
    public decimal TotalReplacementValue { get; set; }
    public decimal TotalInsuredValue { get; set; }
    public decimal TotalWrittenDownValue { get; set; }
    public List<AssetValuationByLocationDto> ByLocation { get; set; } = new();
}

public class AssetValuationByLocationDto
{
    public string Location { get; set; } = string.Empty;
    public decimal ReplacementValue { get; set; }
    public decimal InsuredValue { get; set; }
    public decimal WrittenDownValue { get; set; }
}

public class GetAssetDepreciationReportQueryHandler : IRequestHandler<GetAssetDepreciationReportQuery, AssetDepreciationReportDto>
{
    public async Task<AssetDepreciationReportDto> Handle(GetAssetDepreciationReportQuery request, CancellationToken ct)
    {
        await Task.CompletedTask;
        return new AssetDepreciationReportDto
        {
            TotalAssetValue = 0,
            AccumulatedDepreciation = 0,
            NetBookValue = 0,
            ByCategory = new List<DepreciationByCategoryDto>(),
            MonthlyTrends = new List<MonthlyDepreciationTrendDto>(),
        };
    }
}

public class GetAssetValuationReportQueryHandler : IRequestHandler<GetAssetValuationReportQuery, AssetValuationReportDto>
{
    public async Task<AssetValuationReportDto> Handle(GetAssetValuationReportQuery request, CancellationToken ct)
    {
        await Task.CompletedTask;
        return new AssetValuationReportDto
        {
            TotalReplacementValue = 0,
            TotalInsuredValue = 0,
            TotalWrittenDownValue = 0,
            ByLocation = new List<AssetValuationByLocationDto>(),
        };
    }
}
