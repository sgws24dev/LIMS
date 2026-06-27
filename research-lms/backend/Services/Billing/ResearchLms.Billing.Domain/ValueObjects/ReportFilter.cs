using ResearchLms.Billing.Domain.Enums;

namespace ResearchLms.Billing.Domain.ValueObjects;

public class ReportFilter
{
    public string FieldName { get; }
    public FilterOperator Operator { get; }
    public string Value { get; }
    public string? SecondValue { get; }

    public ReportFilter(string fieldName, FilterOperator @operator, string value, string? secondValue = null)
    {
        FieldName = fieldName;
        Operator = @operator;
        Value = value;
        SecondValue = secondValue;
    }

    private ReportFilter() { FieldName = null!; Value = null!; }
}
