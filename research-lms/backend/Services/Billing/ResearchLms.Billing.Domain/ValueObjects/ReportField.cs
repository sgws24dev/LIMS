using ResearchLms.Billing.Domain.Enums;

namespace ResearchLms.Billing.Domain.ValueObjects;

public class ReportField
{
    public string SourceEntity { get; }
    public string FieldName { get; }
    public string DisplayName { get; }
    public AggregationType Aggregation { get; }

    public ReportField(string sourceEntity, string fieldName, string displayName, AggregationType aggregation = AggregationType.None)
    {
        SourceEntity = sourceEntity;
        FieldName = fieldName;
        DisplayName = displayName;
        Aggregation = aggregation;
    }

    private ReportField() { SourceEntity = null!; FieldName = null!; DisplayName = null!; }
}
