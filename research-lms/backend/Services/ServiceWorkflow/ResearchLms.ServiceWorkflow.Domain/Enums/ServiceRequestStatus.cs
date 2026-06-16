namespace ResearchLms.ServiceWorkflow.Domain.Enums;

public enum ServiceRequestStatus
{
    Draft,
    Submitted,
    PendingApproval,
    InReview,
    Approved,
    Rejected,
    InProgress,
    Completed,
    Cancelled,
    OnHold
}
