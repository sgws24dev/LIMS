using System.Text.Json;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Infrastructure.Services.WidgetDataSources;

public class MockWidgetDataSource : IWidgetDataSource
{
    public string WidgetType => "*";

    public Task<WidgetData> GetDataAsync(string config, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var labels = new List<string> { "Jan", "Feb", "Mar", "Apr", "May", "Jun" };
        var datasets = new List<WidgetDataset>
        {
            new("Value", new List<decimal> { 45000, 52000, 48000, 61000, 58000, 72000 }, "#3b82f6"),
        };

        return Task.FromResult(new WidgetData(labels, datasets));
    }
}
