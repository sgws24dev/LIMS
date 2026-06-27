using MediatR;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Reports;

public record ExportReportQuery(Guid ReportDefinitionId, ReportFormat Format) : IRequest<ReportExportResult>;

public class ExportReportQueryHandler : IRequestHandler<ExportReportQuery, ReportExportResult>
{
    private readonly IReportService _reportService;
    private readonly IReportExportService _exportService;
    private readonly IReportRepository _repository;

    public ExportReportQueryHandler(IReportService reportService, IReportExportService exportService, IReportRepository repository)
    {
        _reportService = reportService;
        _exportService = exportService;
        _repository = repository;
    }

    public async Task<ReportExportResult> Handle(ExportReportQuery request, CancellationToken ct)
    {
        var report = await _repository.GetByIdAsync(request.ReportDefinitionId, ct)
            ?? throw new InvalidOperationException($"Report definition not found: {request.ReportDefinitionId}");

        var result = await _reportService.RunAsync(report, 1, 10000, ct);
        var export = await _exportService.ExportAsync(result, request.Format, ct);

        return export;
    }
}
