using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.ServiceWorkflow.Domain.Entities;

public class Approval : BaseEntity
{
    public Guid ServiceRequestId { get; private set; }
    public int StepOrder { get; private set; }
    public string ApproverUserId { get; private set; }
    public string? ApproverName { get; private set; }
    public ApprovalStatus Status { get; private set; }
    public string? Comment { get; private set; }
    public DateTime? DecidedAt { get; private set; }

    public ServiceRequest ServiceRequest { get; private set; } = null!;

    private Approval() { ApproverUserId = null!; }

    public Approval(
        Guid serviceRequestId,
        int stepOrder,
        string approverUserId,
        string? approverName = null)
    {
        ServiceRequestId = serviceRequestId;
        StepOrder = stepOrder;
        ApproverUserId = approverUserId;
        ApproverName = approverName;
        Status = ApprovalStatus.Pending;
        MarkCreated(approverUserId);
    }

    public void Approve(string approvedBy, string? comment = null)
    {
        if (Status != ApprovalStatus.Pending)
            throw new InvalidOperationException("Only pending approvals can be decided.");

        Status = ApprovalStatus.Approved;
        Comment = comment;
        DecidedAt = DateTime.UtcNow;
        MarkUpdated(approvedBy);
    }

    public void Reject(string rejectedBy, string? comment = null)
    {
        if (Status != ApprovalStatus.Pending)
            throw new InvalidOperationException("Only pending approvals can be decided.");

        Status = ApprovalStatus.Rejected;
        Comment = comment;
        DecidedAt = DateTime.UtcNow;
        MarkUpdated(rejectedBy);
    }

    public void Skip(string modifiedBy)
    {
        if (Status != ApprovalStatus.Pending)
            throw new InvalidOperationException("Only pending approvals can be skipped.");

        Status = ApprovalStatus.Skipped;
        MarkUpdated(modifiedBy);
    }
}
