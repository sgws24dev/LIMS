using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public class TelemetryRecord : BaseEntity
{
    public Guid InstrumentId { get; private set; }
    public DateTime ReceivedAt { get; private set; }
    public DateTime Timestamp { get; private set; }
    public Dictionary<string, double> Metrics { get; private set; } = new();
    public string? Source { get; private set; }
    public bool IsValid { get; private set; } = true;
    public string? ValidationNotes { get; private set; }

    public Instrument? Instrument { get; private set; }

    private TelemetryRecord() { }

    public TelemetryRecord(
        Guid instrumentId,
        DateTime timestamp,
        Dictionary<string, double> metrics,
        string? source,
        bool isValid = true,
        string? validationNotes = null)
    {
        InstrumentId = instrumentId;
        ReceivedAt = DateTime.UtcNow;
        Timestamp = timestamp;
        Metrics = metrics;
        Source = source;
        IsValid = isValid;
        ValidationNotes = validationNotes;
    }

    public void MarkInvalid(string notes)
    {
        IsValid = false;
        ValidationNotes = notes;
    }
}
