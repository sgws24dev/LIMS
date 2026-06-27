using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Infrastructure.Services.Iot.Adapters;

public class ModbusAdapter : IIoTIngestionService
{
    private readonly IIoTIngestionService _inner;

    public ModbusAdapter(IIoTIngestionService inner)
    {
        _inner = inner;
    }

    public async Task IngestAsync(IoTTelemetryPoint point, CancellationToken ct = default)
    {
        // In production: poll Modbus TCP slaves on configurable interval,
        // read holding registers, map to metrics via config.
        // Uses EasyModbus or NModbus library.
        await _inner.IngestAsync(point, ct);
    }
}
