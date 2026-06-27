using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Infrastructure.Services.ReportServices;

public class ReportExportService : IReportExportService
{
    private readonly CsvExportService _csvExportService;
    private readonly ExcelExportService _excelExportService;
    private readonly PdfExportService _pdfExportService;

    public ReportExportService(
        CsvExportService csvExportService,
        ExcelExportService excelExportService,
        PdfExportService pdfExportService)
    {
        _csvExportService = csvExportService;
        _excelExportService = excelExportService;
        _pdfExportService = pdfExportService;
    }

    public Task<ReportExportResult> ExportAsync(ReportResult data, ReportFormat format, CancellationToken ct = default)
    {
        return format switch
        {
            ReportFormat.Csv => _csvExportService.ExportAsync(data, format, ct),
            ReportFormat.Pdf => _pdfExportService.ExportAsync(data, format, ct),
            ReportFormat.Xlsx => _excelExportService.ExportAsync(data, format, ct),
            _ => throw new InvalidOperationException($"Unsupported export format: {format}"),
        };
    }
}
