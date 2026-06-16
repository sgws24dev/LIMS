namespace ResearchLms.Facilities.Application.DTOs;

public record TelemetryRecordDto(
    Guid Id, Guid InstrumentId, DateTime Timestamp, Dictionary<string, double> Metrics,
    string? Source, bool IsValid);

public record TelemetrySummaryDto(
    Guid InstrumentId, DateTime? LatestTimestamp, bool IsOnline,
    Dictionary<string, double> MetricLatestValues);

public record IngestTelemetryRequest(
    Guid InstrumentId, DateTime Timestamp, Dictionary<string, double> Metrics, string? Source);

public record IngestTelemetryBatchRequest(IReadOnlyList<IngestTelemetryRequest> Records);

public record IngestBatchResult(int Accepted, int Rejected, IReadOnlyList<string> Errors);
