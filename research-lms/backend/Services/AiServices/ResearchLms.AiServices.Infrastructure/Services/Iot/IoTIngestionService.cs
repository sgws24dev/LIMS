using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Infrastructure.Services.Iot;

public class IoTIngestionService : IIoTIngestionService
{
    private readonly IIoTTelemetryRepository _telemetryRepo;
    private readonly IAlertEngine _alertEngine;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _user;

    public IoTIngestionService(
        IIoTTelemetryRepository telemetryRepo,
        IAlertEngine alertEngine,
        ITenantContext tenant,
        ICurrentUser user)
    {
        _telemetryRepo = telemetryRepo;
        _alertEngine = alertEngine;
        _tenant = tenant;
        _user = user;
    }

    public async Task IngestAsync(IoTTelemetryPoint point, CancellationToken ct = default)
    {
        var telemetry = new IoTTelemetry(
            point.InstrumentId, point.Timestamp, point.MetricName,
            point.MetricValue, point.Unit, point.Tags);
        telemetry.SetTenant(_tenant.TenantId);
        telemetry.MarkCreated(_user.Name);
        await _telemetryRepo.AddAsync(telemetry, ct);

        await _alertEngine.EvaluateAsync(point, ct);
    }
}
