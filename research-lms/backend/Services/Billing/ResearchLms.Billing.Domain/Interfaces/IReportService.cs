using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IReportService
{
    Task<ReportPreview> PreviewAsync(ReportDefinition definition, CancellationToken ct = default);
    Task<ReportResult> RunAsync(ReportDefinition definition, int page = 1, int pageSize = 100, CancellationToken ct = default);
}
