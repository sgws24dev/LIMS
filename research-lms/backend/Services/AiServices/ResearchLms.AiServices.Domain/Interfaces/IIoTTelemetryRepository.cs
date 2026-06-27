using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IIoTTelemetryRepository
{
    Task AddAsync(IoTTelemetry telemetry, CancellationToken ct = default);
    Task<IReadOnlyList<IoTTelemetry>> GetByInstrumentAsync(Guid tenantId, Guid instrumentId, string? metricName = null,
        DateTime? from = null, DateTime? to = null, int limit = 100, CancellationToken ct = default);
    Task<IoTTelemetry?> GetLatestAsync(Guid tenantId, Guid instrumentId, string metricName, CancellationToken ct = default);
}
