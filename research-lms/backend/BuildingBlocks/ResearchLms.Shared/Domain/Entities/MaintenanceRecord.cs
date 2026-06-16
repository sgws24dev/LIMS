using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public enum MaintenanceType { Preventive, Corrective, Inspection, Emergency }
public enum MaintenanceStatus { Scheduled, InProgress, Completed, Cancelled, Overdue }

public class MaintenanceRecord : BaseEntity
{
    private readonly List<WorkOrder> _workOrders = new();

    public Guid AssetId { get; private set; }
    public MaintenanceType Type { get; private set; }
    public DateOnly ScheduledDate { get; private set; }
    public DateOnly? CompletedDate { get; private set; }
    public Guid? TechnicianId { get; private set; }
    public string? TechnicianName { get; private set; }
    public MaintenanceStatus Status { get; private set; } = MaintenanceStatus.Scheduled;
    public decimal? Cost { get; private set; }
    public string? Description { get; private set; }
    public string? Notes { get; private set; }

    public Asset? Asset { get; private set; }
    public IReadOnlyCollection<WorkOrder> WorkOrders => _workOrders.AsReadOnly();

    private MaintenanceRecord() : base() { }

    public MaintenanceRecord(
        Guid assetId, MaintenanceType type, DateOnly scheduledDate,
        string? description, string? notes, decimal? cost, string? technicianName = null)
    {
        AssetId = assetId;
        Type = type;
        ScheduledDate = scheduledDate;
        Description = description;
        Notes = notes;
        Cost = cost;
        TechnicianName = technicianName;
        Status = MaintenanceStatus.Scheduled;
    }

    public void Update(MaintenanceType type, DateOnly scheduledDate, string? description, string? notes, decimal? cost, string? technicianName = null)
    {
        Type = type;
        ScheduledDate = scheduledDate;
        Description = description;
        Notes = notes;
        Cost = cost;
        TechnicianName = technicianName ?? TechnicianName;
    }

    public void Complete(DateOnly completedDate, string? notes, decimal? cost)
    {
        CompletedDate = completedDate;
        Notes = notes ?? Notes;
        if (cost.HasValue) Cost = cost;
        Status = MaintenanceStatus.Completed;
    }

    public void MarkOverdue()
    {
        if (Status == MaintenanceStatus.Scheduled || Status == MaintenanceStatus.InProgress)
            Status = MaintenanceStatus.Overdue;
    }
}
