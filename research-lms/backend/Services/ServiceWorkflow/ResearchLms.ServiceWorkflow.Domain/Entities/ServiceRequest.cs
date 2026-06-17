using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.ServiceWorkflow.Domain.Entities;

public class ServiceRequest : BaseEntity
{
    public Guid FormDefinitionId { get; private set; }
    public int FormDefinitionVersion { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public ServiceRequestStatus Status { get; private set; }
    public Priority Priority { get; private set; }
    public string FormData { get; private set; }
    public string? AssignedTo { get; private set; }
    public DateTime? SubmittedAt { get; private set; }
    public string? SubmittedBy { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? CompletedBy { get; private set; }
    public Guid? ParentRequestId { get; private set; }
    public ApprovalRoutingType ApprovalRouting { get; private set; }

    private readonly List<RequestMilestone> _milestones = new();
    public IReadOnlyCollection<RequestMilestone> Milestones => _milestones.AsReadOnly();

    private readonly List<Approval> _approvals = new();
    public IReadOnlyCollection<Approval> Approvals => _approvals.AsReadOnly();

    private readonly List<RequestStatusHistory> _statusHistory = new();
    public IReadOnlyCollection<RequestStatusHistory> StatusHistory => _statusHistory.AsReadOnly();

    public FormDefinition FormDefinition { get; private set; } = null!;
    public ServiceRequest? ParentRequest { get; private set; }

    private ServiceRequest() { Title = null!; FormData = null!; }

    public ServiceRequest(
        Guid formDefinitionId,
        int formDefinitionVersion,
        string title,
        string? description,
        string formData,
        ApprovalRoutingType approvalRouting,
        Priority priority,
        DateTime? dueDate,
        string createdBy)
    {
        FormDefinitionId = formDefinitionId;
        FormDefinitionVersion = formDefinitionVersion;
        Title = title;
        Description = description;
        Status = ServiceRequestStatus.Draft;
        Priority = priority;
        FormData = formData;
        DueDate = dueDate;
        ApprovalRouting = approvalRouting;
        MarkCreated(createdBy);
    }

    public void Submit(string submittedBy)
    {
        if (Status != ServiceRequestStatus.Draft)
            throw new InvalidOperationException("Only draft requests can be submitted.");

        var previous = Status;
        Status = ServiceRequestStatus.Submitted;
        SubmittedAt = DateTime.UtcNow;
        SubmittedBy = submittedBy;
        MarkUpdated(submittedBy);

        _statusHistory.Add(new RequestStatusHistory(Id, previous, Status, submittedBy));
    }

    public void SendForApproval(string modifiedBy)
    {
        if (Status != ServiceRequestStatus.Submitted)
            throw new InvalidOperationException("Only submitted requests can be sent for approval.");

        var previous = Status;
        Status = ServiceRequestStatus.PendingApproval;
        MarkUpdated(modifiedBy);

        _statusHistory.Add(new RequestStatusHistory(Id, previous, Status, modifiedBy));
    }

    public void Approve(string approvedBy)
    {
        if (Status != ServiceRequestStatus.PendingApproval)
            throw new InvalidOperationException("Only pending-approval requests can be approved.");

        var previous = Status;
        Status = ServiceRequestStatus.Approved;
        MarkUpdated(approvedBy);

        _statusHistory.Add(new RequestStatusHistory(Id, previous, Status, approvedBy));
    }

    public void Reject(string rejectedBy, string? comment = null)
    {
        if (Status != ServiceRequestStatus.PendingApproval)
            throw new InvalidOperationException("Only pending-approval requests can be rejected.");

        var previous = Status;
        Status = ServiceRequestStatus.Rejected;
        MarkUpdated(rejectedBy);

        _statusHistory.Add(new RequestStatusHistory(Id, previous, Status, rejectedBy, comment));
    }

    public void SetInReview(string modifiedBy)
    {
        var previous = Status;
        Status = ServiceRequestStatus.InReview;
        MarkUpdated(modifiedBy);

        _statusHistory.Add(new RequestStatusHistory(Id, previous, Status, modifiedBy));
    }

    public void SetInProgress(string modifiedBy)
    {
        var previous = Status;
        Status = ServiceRequestStatus.InProgress;
        MarkUpdated(modifiedBy);

        _statusHistory.Add(new RequestStatusHistory(Id, previous, Status, modifiedBy));
    }

    public void Complete(string completedBy)
    {
        if (Status != ServiceRequestStatus.InProgress)
            throw new InvalidOperationException("Only in-progress requests can be completed.");

        var previous = Status;
        Status = ServiceRequestStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        CompletedBy = completedBy;
        MarkUpdated(completedBy);

        _statusHistory.Add(new RequestStatusHistory(Id, previous, Status, completedBy));
    }

    public void Cancel(string cancelledBy, string? comment = null)
    {
        if (Status is ServiceRequestStatus.Completed or ServiceRequestStatus.Rejected)
            throw new InvalidOperationException("Completed or rejected requests cannot be cancelled.");

        var previous = Status;
        Status = ServiceRequestStatus.Cancelled;
        MarkUpdated(cancelledBy);

        _statusHistory.Add(new RequestStatusHistory(Id, previous, Status, cancelledBy, comment));
    }

    public void Hold(string modifiedBy, string? comment = null)
    {
        var previous = Status;
        Status = ServiceRequestStatus.OnHold;
        MarkUpdated(modifiedBy);

        _statusHistory.Add(new RequestStatusHistory(Id, previous, Status, modifiedBy, comment));
    }

    public void AssignTo(string userId, string assignedBy)
    {
        AssignedTo = userId;
        MarkUpdated(assignedBy);
    }

    public void AddMilestone(RequestMilestone milestone)
    {
        _milestones.Add(milestone);
    }

    public void AddApproval(Approval approval)
    {
        _approvals.Add(approval);
    }
}
