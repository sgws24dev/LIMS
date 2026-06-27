using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Reports;

public record RunReportQuery(Guid ReportDefinitionId, int Page = 1, int PageSize = 100) : IRequest<ReportResultDto>;

public class RunReportQueryHandler : IRequestHandler<RunReportQuery, ReportResultDto>
{
    private readonly IReportService _reportService;
    private readonly IReportRepository _repository;

    public RunReportQueryHandler(IReportService reportService, IReportRepository repository)
    {
        _reportService = reportService;
        _repository = repository;
    }

    public async Task<ReportResultDto> Handle(RunReportQuery request, CancellationToken ct)
    {
        var report = await _repository.GetByIdAsync(request.ReportDefinitionId, ct)
            ?? throw new InvalidOperationException($"Report definition not found: {request.ReportDefinitionId}");

        var result = await _reportService.RunAsync(report, request.Page, request.PageSize, ct);

        return new ReportResultDto
        {
            Columns = result.Columns.ToList(),
            Rows = result.Rows.ToList(),
            TotalCount = result.TotalCount,
            Page = request.Page,
            PageSize = request.PageSize,
        };
    }
}
