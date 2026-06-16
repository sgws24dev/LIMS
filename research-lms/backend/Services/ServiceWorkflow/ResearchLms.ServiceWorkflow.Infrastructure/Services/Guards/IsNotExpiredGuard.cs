using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services.Guards;

public class IsNotExpiredGuard : IWorkflowGuard
{
    public string Name => "IsNotExpired";

    public Task<GuardResult> EvaluateAsync(
        WorkflowInstance instance,
        Dictionary<string, object> context,
        CancellationToken ct = default)
    {
        if (instance.EntityType != "ServiceRequest")
            return Task.FromResult(new GuardResult(true, null));

        var isExpired = context.TryGetValue("IsExpired", out var val)
            && val is bool b && b;

        return Task.FromResult(new GuardResult(!isExpired,
            isExpired ? "Request has passed its due date." : null));
    }
}
