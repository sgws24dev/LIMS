using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IIoTIngestionService
{
    Task IngestAsync(IoTTelemetryPoint point, CancellationToken ct = default);
}
