using System.Text;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Infrastructure.Services.ReportServices;

public class CsvExportService : IReportExportService
{
    public Task<ReportExportResult> ExportAsync(ReportResult data, ReportFormat format, CancellationToken ct = default)
    {
        var sb = new StringBuilder();

        sb.AppendLine(string.Join(",", data.Columns.Select(EscapeCsvField)));

        foreach (var row in data.Rows)
        {
            var rowDict = (IDictionary<string, object?>)row;
            var values = data.Columns.Select(col =>
            {
                rowDict.TryGetValue(col, out var val);
                return EscapeCsvField(val?.ToString() ?? "");
            });
            sb.AppendLine(string.Join(",", values));
        }

        var content = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();

        return Task.FromResult(new ReportExportResult(content, "text/csv", "report.csv"));
    }

    private static string EscapeCsvField(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}
