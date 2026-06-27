using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Infrastructure.Services.Iot.Adapters;

public class OpcUaAdapter : IIoTIngestionService
{
    private readonly IIoTIngestionService _inner;

    public OpcUaAdapter(IIoTIngestionService inner)
    {
        _inner = inner;
    }

    public async Task IngestAsync(IoTTelemetryPoint point, CancellationToken ct = default)
    {
        // In production: connect to OPC-UA server, subscribe to monitored items,
        // and push telemetry via the inner ingestion service.
        // Uses OPCFoundation.NetStandard.Opc.Ua client.
        await _inner.IngestAsync(point, ct);
    }
}
