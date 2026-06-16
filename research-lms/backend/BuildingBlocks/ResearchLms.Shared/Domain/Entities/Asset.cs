using System.ComponentModel.DataAnnotations.Schema;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Shared.Domain.Entities;

public class Asset : BaseEntity
{
    private readonly List<MaintenanceRecord> _maintenanceRecords = new();
    private readonly List<CustodyEvent> _custodyEvents = new();

    protected Asset() { }

    public Asset(
        string name, string identifier, string category, string assetType,
        Guid facilityId, string? model, string? manufacturer,
        DateOnly? acquisitionDate, decimal? acquisitionCost,
        decimal? salvageValue, int? usefulLifeYears,
        DepreciationMethod? depreciationMethod, string? location,
        Dictionary<string, string>? customFields, string? qrCode, string? rfidTag)
    {
        Name = name;
        Identifier = identifier;
        Category = category;
        AssetType = assetType;
        FacilityId = facilityId;
        Model = model;
        Manufacturer = manufacturer;
        AcquisitionDate = acquisitionDate;
        AcquisitionCost = acquisitionCost;
        CurrentValue = acquisitionCost;
        SalvageValue = salvageValue;
        UsefulLifeYears = usefulLifeYears;
        DepreciationMethod = depreciationMethod;
        Location = location;
        CustomFields = customFields ?? new();
        QrCode = qrCode;
        RfidTag = rfidTag;
        Status = AssetStatus.Active;
    }

    public Guid FacilityId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Identifier { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public string AssetType { get; protected set; } = string.Empty;
    public string? Model { get; private set; }
    public string? Manufacturer { get; private set; }
    public DateOnly? AcquisitionDate { get; private set; }
    public decimal? AcquisitionCost { get; private set; }
    public decimal? CurrentValue { get; private set; }
    public decimal? SalvageValue { get; private set; }
    public int? UsefulLifeYears { get; private set; }
    public DepreciationMethod? DepreciationMethod { get; private set; }
    public string? Location { get; private set; }
    public AssetStatus Status { get; private set; }
    public Dictionary<string, string> CustomFields { get; private set; } = new();
    public string? QrCode { get; private set; }
    public string? RfidTag { get; private set; }

    [ForeignKey(nameof(FacilityId))]
    public Facility? Facility { get; private set; }
    public IReadOnlyCollection<MaintenanceRecord> MaintenanceRecords => _maintenanceRecords.AsReadOnly();
    public IReadOnlyCollection<CustodyEvent> CustodyEvents => _custodyEvents.AsReadOnly();

    public void Update(
        string name, string category, string? model, string? manufacturer,
        DateOnly? acquisitionDate, decimal? acquisitionCost, decimal? salvageValue,
        int? usefulLifeYears, DepreciationMethod? depreciationMethod,
        string? location, Dictionary<string, string>? customFields,
        string? qrCode, string? rfidTag)
    {
        Name = name;
        Category = category;
        Model = model;
        Manufacturer = manufacturer;
        AcquisitionDate = acquisitionDate;
        AcquisitionCost = acquisitionCost;
        CurrentValue = acquisitionCost;
        SalvageValue = salvageValue;
        UsefulLifeYears = usefulLifeYears;
        DepreciationMethod = depreciationMethod;
        Location = location;
        CustomFields = customFields ?? new();
        QrCode = qrCode;
        RfidTag = rfidTag;
    }

    public void AddCustodyEvent(CustodyEvent custodyEvent)
    {
        _custodyEvents.Add(custodyEvent);
    }

    public void UpdateLocation(string location)
    {
        Location = location;
    }

    public void Decommission()
    {
        Status = AssetStatus.Decommissioned;
    }

    public void SetStatus(AssetStatus status)
    {
        Status = status;
    }

    public void UpdateCurrentValue(decimal currentValue)
    {
        CurrentValue = currentValue;
    }
}
