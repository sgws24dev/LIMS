using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Infrastructure.Services.WidgetDataSources;

public abstract class WidgetDataSourceBase : IWidgetDataSource
{
    public abstract string WidgetType { get; }

    public abstract Task<WidgetData> GetDataAsync(string config, DateTime from, DateTime to, CancellationToken ct = default);

    protected static List<string> GenerateMonthLabels(DateTime from, DateTime to)
    {
        var labels = new List<string>();
        var current = new DateTime(from.Year, from.Month, 1);
        while (current <= to)
        {
            labels.Add(current.ToString("MMM yyyy"));
            current = current.AddMonths(1);
        }
        return labels;
    }
}
