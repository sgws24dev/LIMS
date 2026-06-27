namespace ResearchLms.Billing.Application.DTOs;

public class WidgetDataDto
{
    public List<string> Labels { get; set; } = new();
    public List<WidgetDatasetDto> Datasets { get; set; } = new();
    public decimal? ChangePercent { get; set; }
    public string? TrendDirection { get; set; }
}

public class WidgetDatasetDto
{
    public string Label { get; set; } = string.Empty;
    public List<decimal> Data { get; set; } = new();
    public string Color { get; set; } = string.Empty;
}
