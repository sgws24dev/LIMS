using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IWorkflowGuard
{
    string Name { get; }
    Task<GuardResult> EvaluateAsync(
        WorkflowInstance instance,
        Dictionary<string, object> context,
        CancellationToken ct = default);
}

public record GuardResult(bool Passed, string? FailureReason);
