namespace ResearchLms.Billing.Domain.ValueObjects;

public class WidgetConfig
{
    public string WidgetType { get; set; } = string.Empty;
    public KpiConfig? Kpi { get; set; }
    public ChartConfig? Chart { get; set; }
    public TableConfig? Table { get; set; }
}

public class KpiConfig
{
    public string Metric { get; set; } = string.Empty;
    public bool ShowComparison { get; set; }
    public string Format { get; set; } = "number";
}

public class ChartConfig
{
    public string Metric { get; set; } = string.Empty;
    public string Aggregation { get; set; } = "sum";
    public string GroupBy { get; set; } = string.Empty;
    public string Granularity { get; set; } = "month";
    public string Color { get; set; } = "#3b82f6";
}

public class TableConfig
{
    public List<string> Columns { get; set; } = new();
    public string? SortColumn { get; set; }
    public bool SortDescending { get; set; }
}
