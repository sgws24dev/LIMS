using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface INotificationRuleRepository
{
    Task<NotificationRule?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<NotificationRule>> GetByDefinitionIdAsync(Guid definitionId, CancellationToken ct = default);
    Task AddAsync(NotificationRule rule, CancellationToken ct = default);
    Task UpdateAsync(NotificationRule rule, CancellationToken ct = default);
    Task DeleteAsync(NotificationRule rule, CancellationToken ct = default);
}
