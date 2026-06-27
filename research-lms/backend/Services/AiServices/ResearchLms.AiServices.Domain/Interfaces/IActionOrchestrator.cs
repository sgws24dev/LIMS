using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IActionOrchestrator
{
    Task<ActionPlan> ParseIntentAsync(string utterance, Guid userId, CancellationToken ct = default);
}
