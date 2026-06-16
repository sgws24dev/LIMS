using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public enum WorkOrderPriority { Low, Medium, High, Critical }
public enum WorkOrderStatus { Open, InProgress, OnHold, Resolved, Closed }

public class WorkOrder : BaseEntity
{
    public Guid MaintenanceRecordId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid? AssigneeId { get; private set; }
    public string? AssigneeName { get; private set; }
    public WorkOrderPriority Priority { get; private set; }
    public WorkOrderStatus Status { get; private set; } = WorkOrderStatus.Open;
    public DateOnly? DueDate { get; private set; }
    public DateOnly? ResolvedDate { get; private set; }
    public string? ResolutionNotes { get; private set; }

    public MaintenanceRecord? MaintenanceRecord { get; private set; }

    private WorkOrder() : base() { }

    public WorkOrder(
        Guid maintenanceRecordId, string title, string? description,
        Guid? assigneeId, string? assigneeName,
        WorkOrderPriority priority, DateOnly? dueDate)
    {
        MaintenanceRecordId = maintenanceRecordId;
        Title = title;
        Description = description;
        AssigneeId = assigneeId;
        AssigneeName = assigneeName;
        Priority = priority;
        DueDate = dueDate;
        Status = WorkOrderStatus.Open;
    }

    public void Update(string title, string? description, Guid? assigneeId,
        string? assigneeName, WorkOrderPriority priority, DateOnly? dueDate)
    {
        Title = title;
        Description = description;
        AssigneeId = assigneeId;
        AssigneeName = assigneeName;
        Priority = priority;
        DueDate = dueDate;
    }

    public void Resolve(string? resolutionNotes)
    {
        ResolutionNotes = resolutionNotes;
        ResolvedDate = DateOnly.FromDateTime(DateTime.UtcNow);
        Status = WorkOrderStatus.Resolved;
    }
}
