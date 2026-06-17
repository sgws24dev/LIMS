using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Projects.Domain.Entities;

public class WorkOrder : BaseEntity
{
    public Guid ProjectId { get; private set; }
    public Guid? CostCenterId { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public WorkOrderStatus Status { get; private set; }
    public Priority Priority { get; private set; }
    public Guid? AssignedToId { get; private set; }
    public string? AssignedToName { get; private set; }
    public decimal EstimatedHours { get; private set; }
    public decimal ActualHours { get; private set; }
    public DateOnly? StartDate { get; private set; }
    public DateOnly? DueDate { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public decimal BilledAmount { get; private set; }
    public string? Tags { get; private set; }

    public Project Project { get; private set; } = null!;
    private readonly List<Issue> _issues = new();
    public IReadOnlyCollection<Issue> Issues => _issues.AsReadOnly();

    private WorkOrder() { Title = null!; }

    public WorkOrder(
        Guid projectId,
        Guid? costCenterId,
        string title,
        string? description,
        Priority priority,
        Guid? assignedToId,
        string? assignedToName,
        decimal estimatedHours,
        DateOnly? startDate,
        DateOnly? dueDate,
        string? tags)
    {
        ProjectId = projectId;
        CostCenterId = costCenterId;
        Title = title;
        Description = description;
        Status = WorkOrderStatus.Open;
        Priority = priority;
        AssignedToId = assignedToId;
        AssignedToName = assignedToName;
        EstimatedHours = estimatedHours;
        ActualHours = 0;
        StartDate = startDate;
        DueDate = dueDate;
        BilledAmount = 0;
        Tags = tags;
    }

    public void Update(Guid? costCenterId, string title, string? description,
        Priority priority, Guid? assignedToId, string? assignedToName,
        decimal estimatedHours, decimal actualHours,
        DateOnly? startDate, DateOnly? dueDate, string? tags)
    {
        CostCenterId = costCenterId;
        Title = title;
        Description = description;
        Priority = priority;
        AssignedToId = assignedToId;
        AssignedToName = assignedToName;
        EstimatedHours = estimatedHours;
        ActualHours = actualHours;
        StartDate = startDate;
        DueDate = dueDate;
        Tags = tags;
    }

    public bool CanTransitionTo(WorkOrderStatus newStatus) =>
        (Status, newStatus) switch
        {
            (WorkOrderStatus.Open, WorkOrderStatus.InProgress) => true,
            (WorkOrderStatus.Open, WorkOrderStatus.Cancelled) => true,
            (WorkOrderStatus.InProgress, WorkOrderStatus.Completed) => true,
            (WorkOrderStatus.InProgress, WorkOrderStatus.Open) => true,
            (WorkOrderStatus.InProgress, WorkOrderStatus.Cancelled) => true,
            _ => false
        };

    public void UpdateStatus(WorkOrderStatus newStatus)
    {
        if (!CanTransitionTo(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {Status} to {newStatus}.");
        Status = newStatus;
        if (newStatus == WorkOrderStatus.Completed)
            CompletedAt = DateTime.UtcNow;
    }

    public void SetBilledAmount(decimal amount)
    {
        BilledAmount = amount;
    }
}
