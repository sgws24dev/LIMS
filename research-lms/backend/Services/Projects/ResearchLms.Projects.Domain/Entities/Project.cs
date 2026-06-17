using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Projects.Domain.Entities;

public class Project : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public ProjectStatus Status { get; private set; }
    public Priority Priority { get; private set; }
    public DateOnly? StartDate { get; private set; }
    public DateOnly? EndDate { get; private set; }
    public decimal Budget { get; private set; }
    public decimal Spent { get; private set; }
    public Guid? ProjectManagerId { get; private set; }
    public string? ProjectManagerName { get; private set; }
    public bool IsArchived { get; private set; }

    private readonly List<WorkOrder> _workOrders = new();
    public IReadOnlyCollection<WorkOrder> WorkOrders => _workOrders.AsReadOnly();

    public decimal BudgetUtilizationPercent =>
        Budget == 0 ? 0 : Math.Round((Spent / Budget) * 100, 2);

    public bool IsOverBudget => Spent > Budget && Budget > 0;

    public bool IsOverdue =>
        EndDate.HasValue &&
        EndDate.Value < DateOnly.FromDateTime(DateTime.UtcNow) &&
        Status != ProjectStatus.Completed &&
        Status != ProjectStatus.Cancelled;

    private Project() { Name = null!; }

    public Project(
        string name,
        string? description,
        Priority priority,
        DateOnly? startDate,
        DateOnly? endDate,
        decimal budget,
        Guid? projectManagerId,
        string? projectManagerName)
    {
        Name = name;
        Description = description;
        Status = ProjectStatus.Planning;
        Priority = priority;
        StartDate = startDate;
        EndDate = endDate;
        Budget = budget;
        Spent = 0;
        ProjectManagerId = projectManagerId;
        ProjectManagerName = projectManagerName;
        IsArchived = false;
    }

    public void Update(string name, string? description, Priority priority,
        DateOnly? startDate, DateOnly? endDate, decimal budget,
        Guid? projectManagerId, string? projectManagerName)
    {
        Name = name;
        Description = description;
        Priority = priority;
        StartDate = startDate;
        EndDate = endDate;
        Budget = budget;
        ProjectManagerId = projectManagerId;
        ProjectManagerName = projectManagerName;
    }

    public bool CanTransitionTo(ProjectStatus newStatus) =>
        (Status, newStatus) switch
        {
            (ProjectStatus.Planning, ProjectStatus.Active) => true,
            (ProjectStatus.Planning, ProjectStatus.Cancelled) => true,
            (ProjectStatus.Active, ProjectStatus.OnHold) => true,
            (ProjectStatus.Active, ProjectStatus.Completed) => true,
            (ProjectStatus.Active, ProjectStatus.Cancelled) => true,
            (ProjectStatus.OnHold, ProjectStatus.Active) => true,
            (ProjectStatus.OnHold, ProjectStatus.Cancelled) => true,
            _ => false
        };

    public void UpdateStatus(ProjectStatus newStatus)
    {
        if (!CanTransitionTo(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {Status} to {newStatus}.");
        Status = newStatus;
    }

    public void AddSpent(decimal amount)
    {
        Spent += amount;
    }

    public void AddWorkOrder(WorkOrder workOrder)
    {
        _workOrders.Add(workOrder);
    }

    public void Archive()
    {
        IsArchived = true;
    }
}
