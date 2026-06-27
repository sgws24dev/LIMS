using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Queries.Iot;

public record GetAlertsQuery(Guid? InstrumentId = null, string? Status = null) : IRequest<List<IoTAlertDto>>;

public class GetAlertsHandler : IRequestHandler<GetAlertsQuery, List<IoTAlertDto>>
{
    private readonly IIoTAlertRepository _repo;
    private readonly ITenantContext _tenant;

    public GetAlertsHandler(IIoTAlertRepository repo, ITenantContext tenant)
    {
        _repo = repo;
        _tenant = tenant;
    }

    public async Task<List<IoTAlertDto>> Handle(GetAlertsQuery request, CancellationToken ct)
    {
        var alerts = await _repo.GetByTenantAsync(_tenant.TenantId, request.InstrumentId, status: request.Status, ct: ct);
        return alerts.Select(a => new IoTAlertDto(
            a.Id, a.InstrumentId, a.RuleId, a.MetricName, a.ActualValue, a.ThresholdValue,
            a.Severity.ToString(), a.Status.ToString(), a.OpenedAt,
            a.AcknowledgedAt, a.ResolvedAt, a.ResolvedByUserId
        )).ToList();
    }
}
