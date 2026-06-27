using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IAutomationService
{
    Task<AutomationActionLog> ExecuteAsync(AutomationRule rule, string triggerEvent, CancellationToken ct = default);
    Task ApproveActionAsync(Guid logId, Guid approvedByUserId, CancellationToken ct = default);
    Task RejectActionAsync(Guid logId, CancellationToken ct = default);
}
