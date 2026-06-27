using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Commands.Reports;

public record CreateReportDefinitionCommand(
    string Name,
    string? Description,
    string SourceEntity,
    string FieldsJson,
    string FiltersJson) : IRequest<ReportDefinitionDto>;

public class CreateReportDefinitionCommandHandler : IRequestHandler<CreateReportDefinitionCommand, ReportDefinitionDto>
{
    private readonly IReportRepository _repository;
    private readonly ITenantContext _tenantContext;

    public CreateReportDefinitionCommandHandler(IReportRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<ReportDefinitionDto> Handle(CreateReportDefinitionCommand request, CancellationToken ct)
    {
        const string userName = "system";

        var report = new ReportDefinition(
            request.Name,
            request.Description,
            request.SourceEntity,
            System.Text.Json.JsonSerializer.Deserialize<List<ResearchLms.Billing.Domain.ValueObjects.ReportField>>(request.FieldsJson) ?? new(),
            System.Text.Json.JsonSerializer.Deserialize<List<ResearchLms.Billing.Domain.ValueObjects.ReportFilter>>(request.FiltersJson) ?? new(),
            userName);

        await _repository.AddAsync(report, ct);

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
        };
    }
}
