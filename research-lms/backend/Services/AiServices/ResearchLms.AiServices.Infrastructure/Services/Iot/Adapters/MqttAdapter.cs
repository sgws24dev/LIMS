using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Infrastructure.Services.Iot.Adapters;

public class MqttAdapter : IIoTIngestionService
{
    private readonly IIoTIngestionService _inner;

    public MqttAdapter(IIoTIngestionService inner)
    {
        _inner = inner;
    }

    public async Task IngestAsync(IoTTelemetryPoint point, CancellationToken ct = default)
    {
        // In production: subscribe to MQTT topics (instruments/{instrumentId}/telemetry),
        // parse JSON payload, and push via inner service.
        // Uses MQTTnet library.
        await _inner.IngestAsync(point, ct);
    }
}
