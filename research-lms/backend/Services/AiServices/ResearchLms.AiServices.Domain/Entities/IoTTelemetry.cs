using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class IoTTelemetry : BaseEntity
{
    public Guid InstrumentId { get; private set; }
    public DateTime Timestamp { get; private set; }
    public string MetricName { get; private set; } = string.Empty;
    public double MetricValue { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public string? Tags { get; private set; }

    protected IoTTelemetry() { }

    public IoTTelemetry(Guid instrumentId, DateTime timestamp, string metricName, double metricValue, string unit, string? tags = null)
    {
        InstrumentId = instrumentId;
        Timestamp = timestamp;
        MetricName = metricName;
        MetricValue = metricValue;
        Unit = unit;
        Tags = tags;
    }
}
