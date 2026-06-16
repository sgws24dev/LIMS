using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Shared.Domain.Entities;

public class Instrument : Asset
{
    private Instrument() { }

    public Instrument(
        string name, string identifier, string category,
        Guid facilityId, string? model, string? manufacturer,
        DateOnly? acquisitionDate, decimal? acquisitionCost,
        decimal? salvageValue, int? usefulLifeYears,
        DepreciationMethod? depreciationMethod, string? location,
        Dictionary<string, string>? customFields, string? qrCode, string? rfidTag,
        string? ipAddress, int? port, ConnectionProtocol? connectionProtocol,
        string? firmware, DateOnly? lastCalibrationDate, DateOnly? nextCalibrationDate,
        int? maintenanceIntervalDays, bool iotEnabled)
        : base(name, identifier, category, "Instrument", facilityId,
              model, manufacturer, acquisitionDate, acquisitionCost,
              salvageValue, usefulLifeYears, depreciationMethod,
              location, customFields, qrCode, rfidTag)
    {
        IpAddress = ipAddress;
        Port = port;
        ConnectionProtocol = connectionProtocol;
        Firmware = firmware;
        LastCalibrationDate = lastCalibrationDate;
        NextCalibrationDate = nextCalibrationDate;
        MaintenanceIntervalDays = maintenanceIntervalDays;
        IotEnabled = iotEnabled;
    }

    public string? IpAddress { get; private set; }
    public int? Port { get; private set; }
    public ConnectionProtocol? ConnectionProtocol { get; private set; }
    public string? Firmware { get; private set; }
    public DateOnly? LastCalibrationDate { get; private set; }
    public DateOnly? NextCalibrationDate { get; private set; }
    public int? MaintenanceIntervalDays { get; private set; }
    public bool IotEnabled { get; private set; }
    public DateTime? LastTelemetryAt { get; private set; }

    public InstrumentConfig? InstrumentConfig { get; private set; }
    private readonly List<CalibrationRecord> _calibrationRecords = new();
    public IReadOnlyCollection<CalibrationRecord> CalibrationRecords => _calibrationRecords.AsReadOnly();

    public void UpdateInstrument(
        string? ipAddress, int? port, ConnectionProtocol? connectionProtocol,
        string? firmware, DateOnly? lastCalibrationDate, DateOnly? nextCalibrationDate,
        int? maintenanceIntervalDays, bool iotEnabled)
    {
        IpAddress = ipAddress;
        Port = port;
        ConnectionProtocol = connectionProtocol;
        Firmware = firmware;
        LastCalibrationDate = lastCalibrationDate;
        NextCalibrationDate = nextCalibrationDate;
        MaintenanceIntervalDays = maintenanceIntervalDays;
        IotEnabled = iotEnabled;
    }

    public void UpdateLastTelemetryAt(DateTime timestamp)
    {
        LastTelemetryAt = timestamp;
    }
}
