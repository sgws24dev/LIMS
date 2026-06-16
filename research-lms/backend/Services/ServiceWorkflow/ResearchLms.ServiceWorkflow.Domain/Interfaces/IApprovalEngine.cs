using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IApprovalEngine
{
    Task<ApprovalDecision> EvaluateAsync(ServiceRequest request, CancellationToken ct = default);
    bool IsApprovalComplete(IReadOnlyCollection<Approval> approvals);
    bool IsRejected(IReadOnlyCollection<Approval> approvals);
    Approval? GetNextPendingApproval(IReadOnlyCollection<Approval> approvals);
}

public enum ApprovalDecision
{
    Pending,
    Approved,
    Rejected
}
