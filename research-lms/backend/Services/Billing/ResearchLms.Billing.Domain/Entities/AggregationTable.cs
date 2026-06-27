using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class AggregationTable : BaseEntity
{
    public AggregationGranularity Granularity { get; private set; }
    public DateTime DateKey { get; private set; }
    public string MetricName { get; private set; }
    public decimal MetricValue { get; private set; }

    private AggregationTable() { MetricName = null!; }

    public AggregationTable(AggregationGranularity granularity, DateTime dateKey, string metricName, decimal metricValue, string createdBy)
    {
        Granularity = granularity;
        DateKey = dateKey;
        MetricName = metricName;
        MetricValue = metricValue;
        MarkCreated(createdBy);
    }

    public void UpdateValue(decimal metricValue, string modifiedBy)
    {
        MetricValue = metricValue;
        MarkUpdated(modifiedBy);
    }
}
