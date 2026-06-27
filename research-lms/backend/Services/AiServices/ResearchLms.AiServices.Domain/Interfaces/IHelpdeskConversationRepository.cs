using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IHelpdeskConversationRepository
{
    Task<IReadOnlyList<HelpdeskConversation>> GetByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<HelpdeskConversation?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(HelpdeskConversation conversation, CancellationToken ct = default);
    Task UpdateAsync(HelpdeskConversation conversation, CancellationToken ct = default);
}
