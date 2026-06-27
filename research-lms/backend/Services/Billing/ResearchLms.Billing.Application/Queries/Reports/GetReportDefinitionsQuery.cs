using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Queries.Reports;

public record GetReportDefinitionsQuery : IRequest<List<ReportDefinitionDto>>;

public class GetReportDefinitionsQueryHandler : IRequestHandler<GetReportDefinitionsQuery, List<ReportDefinitionDto>>
{
    private readonly IReportRepository _repository;
    private readonly ITenantContext _tenantContext;

    public GetReportDefinitionsQueryHandler(IReportRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<List<ReportDefinitionDto>> Handle(GetReportDefinitionsQuery request, CancellationToken ct)
    {
        var reports = await _repository.GetByTenantAsync(_tenantContext.TenantId, ct);

        return reports.Select(r => new ReportDefinitionDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description,
            SourceEntity = r.SourceEntity,
            FieldsJson = r.FieldsJson,
            FiltersJson = r.FiltersJson,
            TenantId = r.TenantId,
            CreatedBy = r.CreatedBy,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt,
        }).ToList();
    }
}
