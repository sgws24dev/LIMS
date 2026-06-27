using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Infrastructure.Services.ReportServices;

public class PdfExportService : IReportExportService
{
    public Task<ReportExportResult> ExportAsync(ReportResult data, ReportFormat format, CancellationToken ct = default)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(20);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Text("Report").SemiBold().FontSize(14);

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(cols =>
                    {
                        foreach (var _ in data.Columns)
                            cols.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        foreach (var col in data.Columns)
                        {
                            header.Cell().Element(cell =>
                            {
                                cell.Background(Colors.Grey.Lighten3)
                                    .Padding(4)
                                    .Text(col).SemiBold().FontSize(8);
                            });
                        }
                    });

                    foreach (var row in data.Rows)
                    {
                        var rowDict = (IDictionary<string, object?>)row;
                        foreach (var col in data.Columns)
                        {
                            rowDict.TryGetValue(col, out var val);
                            table.Cell().Element(cell =>
                            {
                                cell.BorderBottom(1)
                                    .BorderColor(Colors.Grey.Lighten4)
                                    .Padding(2)
                                    .Text(val?.ToString() ?? "").FontSize(7);
                            });
                        }
                    }
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        });

        var content = document.GeneratePdf();
        return Task.FromResult(new ReportExportResult(content, "application/pdf", "report.pdf"));
    }
}
