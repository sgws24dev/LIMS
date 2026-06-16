using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services.Guards;

public class HasActiveApproverGuard : IWorkflowGuard
{
    public string Name => "HasActiveApprover";

    public Task<GuardResult> EvaluateAsync(
        WorkflowInstance instance,
        Dictionary<string, object> context,
        CancellationToken ct = default)
    {
        if (instance.EntityType != "ServiceRequest")
            return Task.FromResult(new GuardResult(true, null));

        var hasActive = context.TryGetValue("HasPendingApprovals", out var val)
            && val is bool b && b;

        return Task.FromResult(new GuardResult(hasActive,
            hasActive ? null : "No active approver assigned to this request."));
    }
}
