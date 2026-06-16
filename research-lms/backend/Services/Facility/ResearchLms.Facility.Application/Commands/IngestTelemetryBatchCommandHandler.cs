using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Commands;

public class IngestTelemetryBatchCommandHandler : IRequestHandler<IngestTelemetryBatchCommand, Result<IngestBatchResult>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly ITelemetryRepository _telemetryRepository;

    public IngestTelemetryBatchCommandHandler(
        IAssetRepository assetRepository,
        ITelemetryRepository telemetryRepository)
    {
        _assetRepository = assetRepository;
        _telemetryRepository = telemetryRepository;
    }

    public async Task<Result<IngestBatchResult>> Handle(IngestTelemetryBatchCommand request, CancellationToken ct)
    {
        if (request.Data.Records.Count > 100)
            return Result.Failure<IngestBatchResult>("Batch size cannot exceed 100 records");

        var accepted = 0;
        var rejected = 0;
        var errors = new List<string>();
        var records = new List<TelemetryRecord>();

        foreach (var item in request.Data.Records)
        {
            try
            {
                var asset = await _assetRepository.GetByIdAsync(item.InstrumentId, ct);
                if (asset is not Instrument instrument)
                {
                    rejected++;
                    errors.Add($"Instrument {item.InstrumentId} not found");
                    continue;
                }

                var metricKeys = instrument.InstrumentConfig?.MetricKeys ?? new();
                var isValid = true;
                var validationNotes = (string?)null;

                if (metricKeys.Count > 0)
                {
                    var unknownKeys = item.Metrics.Keys
                        .Where(k => !metricKeys.Contains(k))
                        .ToList();

                    if (unknownKeys.Count > 0)
                    {
                        isValid = false;
                        validationNotes = $"Unknown metric keys: {string.Join(", ", unknownKeys)}";
                    }
                }

                var record = new TelemetryRecord(
                    item.InstrumentId, item.Timestamp, item.Metrics, item.Source, isValid, validationNotes);

                if (!isValid)
                    record.MarkInvalid(validationNotes!);

                instrument.UpdateLastTelemetryAt(record.ReceivedAt);
                records.Add(record);
                accepted++;
            }
            catch (Exception ex)
            {
                rejected++;
                errors.Add($"Error processing record: {ex.Message}");
            }
        }

        if (records.Count > 0)
        {
            await _telemetryRepository.AddBatchAsync(records, ct);
        }

        var result = new IngestBatchResult(accepted, rejected, errors.AsReadOnly());
        return Result.Success(result);
    }
}
