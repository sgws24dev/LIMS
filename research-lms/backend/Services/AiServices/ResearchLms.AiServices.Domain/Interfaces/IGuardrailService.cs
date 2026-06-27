using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IGuardrailService
{
    Task<GuardrailResult> EvaluateAsync(ActionPlan plan, Guid userId, CancellationToken ct = default);
}
