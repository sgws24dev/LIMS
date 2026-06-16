using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services;

public class ApprovalEngine : IApprovalEngine
{
    public Task<ApprovalDecision> EvaluateAsync(ServiceRequest request, CancellationToken ct = default)
    {
        if (request.Approvals.Count == 0)
            return Task.FromResult(ApprovalDecision.Pending);

        if (request.Approvals.Any(a => a.Status == ApprovalStatus.Rejected))
            return Task.FromResult(ApprovalDecision.Rejected);

        switch (request.ApprovalRouting)
        {
            case ApprovalRoutingType.ChainOfCommand:
                return Task.FromResult(EvaluateChainOfCommand(request.Approvals));
            case ApprovalRoutingType.Parallel:
                return Task.FromResult(EvaluateParallel(request.Approvals));
            case ApprovalRoutingType.AnyOf:
                return Task.FromResult(EvaluateAnyOf(request.Approvals));
            default:
                return Task.FromResult(ApprovalDecision.Pending);
        }
    }

    public bool IsApprovalComplete(IReadOnlyCollection<Approval> approvals)
    {
        if (approvals.Count == 0) return false;
        return approvals.All(a => a.Status != ApprovalStatus.Pending);
    }

    public bool IsRejected(IReadOnlyCollection<Approval> approvals)
    {
        return approvals.Any(a => a.Status == ApprovalStatus.Rejected);
    }

    public Approval? GetNextPendingApproval(IReadOnlyCollection<Approval> approvals)
    {
        return approvals
            .Where(a => a.Status == ApprovalStatus.Pending)
            .MinBy(a => a.StepOrder);
    }

    private static ApprovalDecision EvaluateChainOfCommand(IReadOnlyCollection<Approval> approvals)
    {
        var ordered = approvals.OrderBy(a => a.StepOrder).ToList();

        foreach (var approval in ordered)
        {
            if (approval.Status == ApprovalStatus.Pending)
                return ApprovalDecision.Pending;
            if (approval.Status == ApprovalStatus.Rejected)
                return ApprovalDecision.Rejected;
        }

        return ApprovalDecision.Approved;
    }

    private static ApprovalDecision EvaluateParallel(IReadOnlyCollection<Approval> approvals)
    {
        if (approvals.Any(a => a.Status == ApprovalStatus.Pending))
            return ApprovalDecision.Pending;

        return ApprovalDecision.Approved;
    }

    private static ApprovalDecision EvaluateAnyOf(IReadOnlyCollection<Approval> approvals)
    {
        if (approvals.Any(a => a.Status == ApprovalStatus.Approved))
            return ApprovalDecision.Approved;

        if (approvals.All(a => a.Status == ApprovalStatus.Rejected))
            return ApprovalDecision.Rejected;

        return ApprovalDecision.Pending;
    }
}
