namespace ResearchLms.Shared.Domain.Entities;

public class InstrumentConfig
{
    public Guid InstrumentId { get; private set; }
    public string? ConnectionString { get; private set; }
    public string? AuthToken { get; private set; }
    public int PollingIntervalSeconds { get; private set; } = 60;
    public List<string> MetricKeys { get; private set; } = new();
    public bool IsActive { get; private set; } = true;

    public Instrument? Instrument { get; private set; }

    private InstrumentConfig() { }

    public InstrumentConfig(Guid instrumentId, string? connectionString, string? authToken,
        int pollingIntervalSeconds, List<string>? metricKeys, bool isActive)
    {
        InstrumentId = instrumentId;
        ConnectionString = connectionString;
        AuthToken = authToken;
        PollingIntervalSeconds = pollingIntervalSeconds;
        MetricKeys = metricKeys ?? new();
        IsActive = isActive;
    }

    public void Update(string? connectionString, string? authToken,
        int pollingIntervalSeconds, List<string>? metricKeys, bool isActive)
    {
        ConnectionString = connectionString;
        AuthToken = authToken;
        PollingIntervalSeconds = pollingIntervalSeconds;
        MetricKeys = metricKeys ?? new();
        IsActive = isActive;
    }
}
