using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Queries.Iot;

public record GetInstrumentStatusQuery(Guid InstrumentId) : IRequest<InstrumentStatusDto>;

public class GetInstrumentStatusHandler : IRequestHandler<GetInstrumentStatusQuery, InstrumentStatusDto>
{
    private readonly IIoTTelemetryRepository _telemetryRepo;
    private readonly IIoTAlertRepository _alertRepo;
    private readonly ITenantContext _tenant;

    public GetInstrumentStatusHandler(IIoTTelemetryRepository telemetryRepo, IIoTAlertRepository alertRepo, ITenantContext tenant)
    {
        _telemetryRepo = telemetryRepo;
        _alertRepo = alertRepo;
        _tenant = tenant;
    }

    public async Task<InstrumentStatusDto> Handle(GetInstrumentStatusQuery request, CancellationToken ct)
    {
        var latest = await _telemetryRepo.GetLatestAsync(_tenant.TenantId, request.InstrumentId, "Status", ct);
        var alerts = await _alertRepo.GetByTenantAsync(_tenant.TenantId, request.InstrumentId, status: "Open", ct: ct);
        var activeAlert = alerts.FirstOrDefault();

        var status = activeAlert != null ? "Warning" : latest?.MetricValue > 0 ? "Online" : "Offline";

        return new InstrumentStatusDto(
            request.InstrumentId, status,
            latest != null ? new IoTTelemetryDto(latest.Id, latest.InstrumentId, latest.Timestamp,
                latest.MetricName, latest.MetricValue, latest.Unit, latest.Tags) : null,
            activeAlert != null ? new IoTAlertDto(activeAlert.Id, activeAlert.InstrumentId, activeAlert.RuleId,
                activeAlert.MetricName, activeAlert.ActualValue, activeAlert.ThresholdValue,
                activeAlert.Severity.ToString(), activeAlert.Status.ToString(), activeAlert.OpenedAt,
                activeAlert.AcknowledgedAt, activeAlert.ResolvedAt, activeAlert.ResolvedByUserId) : null
        );
    }
}
