namespace ResearchLms.Billing.Domain.ValueObjects;

public class WidgetData
{
    public IReadOnlyList<string> Labels { get; }
    public IReadOnlyList<WidgetDataset> Datasets { get; }
    public decimal? ChangePercent { get; }
    public string? TrendDirection { get; }

    public WidgetData(
        List<string> labels,
        List<WidgetDataset> datasets,
        decimal? changePercent = null,
        string? trendDirection = null)
    {
        Labels = labels;
        Datasets = datasets;
        ChangePercent = changePercent;
        TrendDirection = trendDirection;
    }
}

public class WidgetDataset
{
    public string Label { get; }
    public IReadOnlyList<decimal> Data { get; }
    public string Color { get; }

    public WidgetDataset(string label, List<decimal> data, string color)
    {
        Label = label;
        Data = data;
        Color = color;
    }
}
