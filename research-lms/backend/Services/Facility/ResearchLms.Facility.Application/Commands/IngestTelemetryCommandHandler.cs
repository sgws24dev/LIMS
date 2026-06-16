using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Commands;

public class IngestTelemetryCommandHandler : IRequestHandler<IngestTelemetryCommand, Result<Guid>>
{
    private readonly ITelemetryRepository _telemetryRepository;
    private readonly IAssetRepository _assetRepository;

    public IngestTelemetryCommandHandler(
        ITelemetryRepository telemetryRepository,
        IAssetRepository assetRepository)
    {
        _telemetryRepository = telemetryRepository;
        _assetRepository = assetRepository;
    }

    public async Task<Result<Guid>> Handle(IngestTelemetryCommand request, CancellationToken ct)
    {
        var asset = await _assetRepository.GetByIdAsync(request.Data.InstrumentId, ct);
        if (asset is not Instrument instrument)
            return Result.Failure<Guid>("Instrument not found");

        var metricKeys = instrument.InstrumentConfig?.MetricKeys ?? new();
        var isValid = true;
        var validationNotes = (string?)null;

        if (metricKeys.Count > 0)
        {
            var unknownKeys = request.Data.Metrics.Keys
                .Where(k => !metricKeys.Contains(k))
                .ToList();

            if (unknownKeys.Count > 0)
            {
                isValid = false;
                validationNotes = $"Unknown metric keys: {string.Join(", ", unknownKeys)}";
            }
        }

        var record = new TelemetryRecord(
            request.Data.InstrumentId,
            request.Data.Timestamp,
            request.Data.Metrics,
            request.Data.Source,
            isValid,
            validationNotes);

        if (!isValid)
            record.MarkInvalid(validationNotes!);

        instrument.UpdateLastTelemetryAt(record.ReceivedAt);

        await _telemetryRepository.AddAsync(record, ct);

        return Result.Success(record.Id);
    }
}
