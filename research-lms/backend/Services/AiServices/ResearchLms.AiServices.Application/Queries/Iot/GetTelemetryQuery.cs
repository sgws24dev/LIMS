using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Queries.Iot;

public record GetTelemetryQuery(Guid InstrumentId, string? MetricName = null,
    DateTime? From = null, DateTime? To = null) : IRequest<List<IoTTelemetryDto>>;

public class GetTelemetryHandler : IRequestHandler<GetTelemetryQuery, List<IoTTelemetryDto>>
{
    private readonly IIoTTelemetryRepository _repo;
    private readonly ITenantContext _tenant;

    public GetTelemetryHandler(IIoTTelemetryRepository repo, ITenantContext tenant)
    {
        _repo = repo;
        _tenant = tenant;
    }

    public async Task<List<IoTTelemetryDto>> Handle(GetTelemetryQuery request, CancellationToken ct)
    {
        var data = await _repo.GetByInstrumentAsync(_tenant.TenantId, request.InstrumentId,
            request.MetricName, request.From, request.To, ct: ct);
        return data.Select(t => new IoTTelemetryDto(
            t.Id, t.InstrumentId, t.Timestamp, t.MetricName, t.MetricValue, t.Unit, t.Tags
        )).ToList();
    }
}
