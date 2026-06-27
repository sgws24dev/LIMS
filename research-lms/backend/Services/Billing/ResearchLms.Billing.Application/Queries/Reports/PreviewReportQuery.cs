using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Reports;

public record PreviewReportQuery(Guid ReportDefinitionId) : IRequest<ReportPreviewDto>;

public class PreviewReportQueryHandler : IRequestHandler<PreviewReportQuery, ReportPreviewDto>
{
    private readonly IReportService _reportService;
    private readonly IReportRepository _repository;

    public PreviewReportQueryHandler(IReportService reportService, IReportRepository repository)
    {
        _reportService = reportService;
        _repository = repository;
    }

    public async Task<ReportPreviewDto> Handle(PreviewReportQuery request, CancellationToken ct)
    {
        var report = await _repository.GetByIdAsync(request.ReportDefinitionId, ct)
            ?? throw new InvalidOperationException($"Report definition not found: {request.ReportDefinitionId}");

        var preview = await _reportService.PreviewAsync(report, ct);

        return new ReportPreviewDto
        {
            Columns = preview.Columns.ToList(),
            Rows = preview.Rows.ToList(),
            TotalCount = preview.TotalCount,
        };
    }
}
