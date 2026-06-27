using System.Dynamic;

namespace ResearchLms.Billing.Application.DTOs;

public class ReportPreviewDto
{
    public List<string> Columns { get; set; } = new();
    public List<ExpandoObject> Rows { get; set; } = new();
    public int TotalCount { get; set; }
}
