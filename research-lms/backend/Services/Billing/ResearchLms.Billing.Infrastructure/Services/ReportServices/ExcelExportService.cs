using OfficeOpenXml;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Infrastructure.Services.ReportServices;

public class ExcelExportService : IReportExportService
{
    public Task<ReportExportResult> ExportAsync(ReportResult data, ReportFormat format, CancellationToken ct = default)
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("Report");

        for (int c = 0; c < data.Columns.Count; c++)
        {
            worksheet.Cells[1, c + 1].Value = data.Columns[c];
        }

        using (var headerRange = worksheet.Cells[1, 1, 1, data.Columns.Count])
        {
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        }

        for (int r = 0; r < data.Rows.Count; r++)
        {
            var rowDict = (IDictionary<string, object?>)data.Rows[r];
            for (int c = 0; c < data.Columns.Count; c++)
            {
                var cell = worksheet.Cells[r + 2, c + 1];
                rowDict.TryGetValue(data.Columns[c], out var val);
                cell.Value = val?.ToString() ?? "";
            }
        }

        worksheet.Cells[1, 1, data.Rows.Count + 1, data.Columns.Count].AutoFitColumns();

        var content = package.GetAsByteArray();
        return Task.FromResult(new ReportExportResult(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "report.xlsx"));
    }
}
