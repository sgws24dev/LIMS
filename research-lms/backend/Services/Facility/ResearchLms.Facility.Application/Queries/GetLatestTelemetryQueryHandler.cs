using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public class GetLatestTelemetryQueryHandler : IRequestHandler<GetLatestTelemetryQuery, Result<IReadOnlyList<TelemetryRecordDto>>>
{
    private readonly ITelemetryRepository _repository;

    public GetLatestTelemetryQueryHandler(ITelemetryRepository repository)
        => _repository = repository;

    public async Task<Result<IReadOnlyList<TelemetryRecordDto>>> Handle(
        GetLatestTelemetryQuery request, CancellationToken ct)
    {
        var records = await _repository.GetLatestAsync(request.InstrumentId, request.Count, ct);

        var dtos = records.Select(r => new TelemetryRecordDto(
            r.Id, r.InstrumentId, r.Timestamp, r.Metrics, r.Source, r.IsValid)).ToList();

        return Result.Success<IReadOnlyList<TelemetryRecordDto>>(dtos);
    }
}
