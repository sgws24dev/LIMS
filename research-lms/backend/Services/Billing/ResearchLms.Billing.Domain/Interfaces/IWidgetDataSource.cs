using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IWidgetDataSource
{
    string WidgetType { get; }
    Task<WidgetData> GetDataAsync(string config, DateTime from, DateTime to, CancellationToken ct = default);
}
