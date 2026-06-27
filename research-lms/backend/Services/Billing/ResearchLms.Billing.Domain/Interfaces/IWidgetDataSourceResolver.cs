using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IWidgetDataSourceResolver
{
    IWidgetDataSource Resolve(string widgetType);
}
