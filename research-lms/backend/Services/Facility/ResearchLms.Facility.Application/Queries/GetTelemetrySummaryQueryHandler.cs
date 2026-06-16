using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public class GetTelemetrySummaryQueryHandler : IRequestHandler<GetTelemetrySummaryQuery, Result<TelemetrySummaryDto>>
{
    private readonly ITelemetryRepository _repository;

    public GetTelemetrySummaryQueryHandler(ITelemetryRepository repository)
        => _repository = repository;

    public async Task<Result<TelemetrySummaryDto>> Handle(
        GetTelemetrySummaryQuery request, CancellationToken ct)
    {
        var latest = await _repository.GetLatestAsync(request.InstrumentId, 1, ct);
        var latestRecord = latest.FirstOrDefault();

        var isOnline = latestRecord is not null &&
                       latestRecord.ReceivedAt > DateTime.UtcNow.AddMinutes(-5);

        var latestValues = new Dictionary<string, double>();
        if (latestRecord is not null)
        {
            latestValues = latestRecord.Metrics;
        }

        var dto = new TelemetrySummaryDto(
            request.InstrumentId,
            latestRecord?.ReceivedAt,
            isOnline,
            latestValues);

        return Result.Success(dto);
    }
}
