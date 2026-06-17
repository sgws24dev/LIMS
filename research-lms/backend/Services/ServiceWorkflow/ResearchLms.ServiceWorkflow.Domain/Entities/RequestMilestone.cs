using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.ServiceWorkflow.Domain.Entities;

public class RequestMilestone : BaseEntity
{
    public Guid ServiceRequestId { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public int Order { get; private set; }
    public MilestoneStatus Status { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? CompletedBy { get; private set; }
    public string? AssignedTo { get; private set; }
    public DateTime? DueDate { get; private set; }

    public ServiceRequest ServiceRequest { get; private set; } = null!;

    private RequestMilestone() { Title = null!; }

    public RequestMilestone(
        Guid serviceRequestId,
        string title,
        string? description,
        int order,
        string createdBy,
        DateTime? dueDate = null,
        string? assignedTo = null)
    {
        ServiceRequestId = serviceRequestId;
        Title = title;
        Description = description;
        Order = order;
        Status = MilestoneStatus.Pending;
        DueDate = dueDate;
        AssignedTo = assignedTo;
        MarkCreated(createdBy);
    }

    public void Start(string modifiedBy)
    {
        if (Status != MilestoneStatus.Pending)
            throw new InvalidOperationException("Only pending milestones can be started.");

        Status = MilestoneStatus.InProgress;
        MarkUpdated(modifiedBy);
    }

    public void Complete(string completedBy)
    {
        if (Status != MilestoneStatus.InProgress)
            throw new InvalidOperationException("Only in-progress milestones can be completed.");

        Status = MilestoneStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        CompletedBy = completedBy;
        MarkUpdated(completedBy);
    }

    public void Skip(string modifiedBy)
    {
        if (Status is MilestoneStatus.Completed)
            throw new InvalidOperationException("Completed milestones cannot be skipped.");

        Status = MilestoneStatus.Skipped;
        MarkUpdated(modifiedBy);
    }
}
