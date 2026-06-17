using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Projects.Domain.Entities;

public class Issue : BaseEntity
{
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public IssueStatus Status { get; private set; }
    public IssueSeverity Severity { get; private set; }
    public IssueType Type { get; private set; }
    public Priority Priority { get; private set; }
    public Guid? AssignedToId { get; private set; }
    public string? AssignedToName { get; private set; }
    public Guid ReportedById { get; private set; }
    public string ReportedByName { get; private set; }
    public Guid? ProjectId { get; private set; }
    public Guid? WorkOrderId { get; private set; }
    public string? ExternalId { get; private set; }
    public string? ExternalUrl { get; private set; }
    public string? ExternalProvider { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public DateTime? ClosedAt { get; private set; }
    public string? Tags { get; private set; }

    public Project? Project { get; private set; }
    public WorkOrder? WorkOrder { get; private set; }

    private Issue() { Title = null!; ReportedByName = null!; }

    public Issue(
        string title,
        string? description,
        IssueSeverity severity,
        IssueType type,
        Priority priority,
        Guid? projectId,
        Guid? workOrderId,
        Guid? assignedToId,
        string? assignedToName,
        Guid reportedById,
        string reportedByName,
        DateTime? dueDate,
        string? tags)
    {
        Title = title;
        Description = description;
        Status = IssueStatus.Open;
        Severity = severity;
        Type = type;
        Priority = priority;
        ProjectId = projectId;
        WorkOrderId = workOrderId;
        AssignedToId = assignedToId;
        AssignedToName = assignedToName;
        ReportedById = reportedById;
        ReportedByName = reportedByName;
        DueDate = dueDate;
        Tags = tags;
    }

    public void Update(string title, string? description, IssueSeverity severity,
        IssueType type, Priority priority, Guid? projectId, Guid? workOrderId,
        Guid? assignedToId, string? assignedToName, DateTime? dueDate, string? tags)
    {
        Title = title;
        Description = description;
        Severity = severity;
        Type = type;
        Priority = priority;
        ProjectId = projectId;
        WorkOrderId = workOrderId;
        AssignedToId = assignedToId;
        AssignedToName = assignedToName;
        DueDate = dueDate;
        Tags = tags;
    }

    public bool CanTransitionTo(IssueStatus newStatus) =>
        (Status, newStatus) switch
        {
            (IssueStatus.Open, IssueStatus.InProgress) => true,
            (IssueStatus.Open, IssueStatus.Resolved) => true,
            (IssueStatus.Open, IssueStatus.Closed) => true,
            (IssueStatus.InProgress, IssueStatus.Resolved) => true,
            (IssueStatus.InProgress, IssueStatus.Closed) => true,
            (IssueStatus.Resolved, IssueStatus.Closed) => true,
            (IssueStatus.Resolved, IssueStatus.Reopened) => true,
            (IssueStatus.Closed, IssueStatus.Reopened) => true,
            (IssueStatus.Reopened, IssueStatus.InProgress) => true,
            (IssueStatus.Reopened, IssueStatus.Resolved) => true,
            _ => false
        };

    public void UpdateStatus(IssueStatus newStatus)
    {
        if (!CanTransitionTo(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {Status} to {newStatus}.");
        Status = newStatus;
        if (newStatus == IssueStatus.Resolved)
            ResolvedAt = DateTime.UtcNow;
        if (newStatus == IssueStatus.Closed)
            ClosedAt = DateTime.UtcNow;
    }

    public void SetExternalRef(string externalId, string externalUrl, string provider)
    {
        ExternalId = externalId;
        ExternalUrl = externalUrl;
        ExternalProvider = provider;
    }
}
