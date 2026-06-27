using System.Dynamic;

namespace ResearchLms.Billing.Domain.ValueObjects;

public class ReportResult
{
    public IReadOnlyList<string> Columns { get; }
    public IReadOnlyList<ExpandoObject> Rows { get; }
    public int TotalCount { get; }

    public ReportResult(List<string> columns, List<ExpandoObject> rows, int totalCount)
    {
        Columns = columns;
        Rows = rows;
        TotalCount = totalCount;
    }
}

public class ReportPreview
{
    public IReadOnlyList<string> Columns { get; }
    public IReadOnlyList<ExpandoObject> Rows { get; }
    public int TotalCount { get; }

    public ReportPreview(List<string> columns, List<ExpandoObject> rows, int totalCount)
    {
        Columns = columns;
        Rows = rows;
        TotalCount = totalCount;
    }
}
