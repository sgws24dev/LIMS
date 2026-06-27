using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IAlertEngine
{
    Task EvaluateAsync(IoTTelemetryPoint point, CancellationToken ct = default);
    Task<IReadOnlyList<IoTAlert>> GetActiveAlertsAsync(Guid tenantId, CancellationToken ct = default);
}
