using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IReportExportService
{
    Task<ReportExportResult> ExportAsync(ReportResult data, ReportFormat format, CancellationToken ct = default);
}

public class ReportExportResult
{
    public byte[] Content { get; }
    public string ContentType { get; }
    public string FileName { get; }

    public ReportExportResult(byte[] content, string contentType, string fileName)
    {
        Content = content;
        ContentType = contentType;
        FileName = fileName;
    }
}
