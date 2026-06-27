using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Reports;

public record GetReportDefinitionByIdQuery(Guid Id) : IRequest<ReportDefinitionDto>;

public class GetReportDefinitionByIdQueryHandler : IRequestHandler<GetReportDefinitionByIdQuery, ReportDefinitionDto>
{
    private readonly IReportRepository _repository;

    public GetReportDefinitionByIdQueryHandler(IReportRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReportDefinitionDto> Handle(GetReportDefinitionByIdQuery request, CancellationToken ct)
    {
        var report = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new InvalidOperationException($"Report definition not found: {request.Id}");

        return new ReportDefinitionDto
        {
            Id = report.Id,
            Name = report.Name,
            Description = report.Description,
            SourceEntity = report.SourceEntity,
            FieldsJson = report.FieldsJson,
            FiltersJson = report.FiltersJson,
            TenantId = report.TenantId,
            CreatedBy = report.CreatedBy,
            CreatedAt = report.CreatedAt,
            UpdatedAt = report.UpdatedAt,
        };
    }
}
