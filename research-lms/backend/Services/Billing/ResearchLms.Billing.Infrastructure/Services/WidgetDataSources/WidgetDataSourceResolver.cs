using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Infrastructure.Services.WidgetDataSources;

public class WidgetDataSourceResolver : IWidgetDataSourceResolver
{
    private readonly IEnumerable<IWidgetDataSource> _dataSources;

    public WidgetDataSourceResolver(IEnumerable<IWidgetDataSource> dataSources)
    {
        _dataSources = dataSources;
    }

    public IWidgetDataSource Resolve(string widgetType)
    {
        return _dataSources.FirstOrDefault(ds => ds.WidgetType == widgetType)
            ?? _dataSources.FirstOrDefault(ds => ds.WidgetType == "*")
            ?? throw new InvalidOperationException($"No data source registered for widget type '{widgetType}'");
    }
}
