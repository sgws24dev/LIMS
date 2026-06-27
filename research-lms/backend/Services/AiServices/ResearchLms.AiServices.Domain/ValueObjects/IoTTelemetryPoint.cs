namespace ResearchLms.AiServices.Domain.ValueObjects;

public record IoTTelemetryPoint(
    Guid InstrumentId,
    DateTime Timestamp,
    string MetricName,
    double MetricValue,
    string Unit,
    string? Tags = null
);
