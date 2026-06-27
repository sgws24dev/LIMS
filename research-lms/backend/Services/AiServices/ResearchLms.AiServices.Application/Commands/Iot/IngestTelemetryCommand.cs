using MediatR;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record IngestTelemetryCommand(Guid InstrumentId, DateTime Timestamp, string MetricName,
    double MetricValue, string Unit, string? Tags) : IRequest<Unit>;

public class IngestTelemetryHandler : IRequestHandler<IngestTelemetryCommand, Unit>
{
    private readonly IIoTIngestionService _ingestion;
    private readonly ITenantContext _tenant;

    public IngestTelemetryHandler(IIoTIngestionService ingestion, ITenantContext tenant)
    {
        _ingestion = ingestion;
        _tenant = tenant;
    }

    public async Task<Unit> Handle(IngestTelemetryCommand request, CancellationToken ct)
    {
        var point = new IoTTelemetryPoint(
            request.InstrumentId, request.Timestamp, request.MetricName,
            request.MetricValue, request.Unit, request.Tags);
        await _ingestion.IngestAsync(point, ct);
        return Unit.Value;
    }
}
