using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services.Guards;

public class AlwaysPassGuard : IWorkflowGuard
{
    public string Name => "AlwaysPass";

    public Task<GuardResult> EvaluateAsync(
        WorkflowInstance _,
        Dictionary<string, object> __,
        CancellationToken ___ = default)
        => Task.FromResult(new GuardResult(true, null));
}
