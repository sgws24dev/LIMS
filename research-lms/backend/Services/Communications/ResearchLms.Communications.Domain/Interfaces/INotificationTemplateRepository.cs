using ResearchLms.Communications.Domain.Entities;
using ResearchLms.Communications.Domain.Enums;

namespace ResearchLms.Communications.Domain.Interfaces;

public interface INotificationTemplateRepository
{
    Task<IReadOnlyList<NotificationTemplate>> GetAllAsync(Guid tenantId, CancellationToken ct = default);
    Task<NotificationTemplate?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<NotificationTemplate?> GetDefaultAsync(Guid tenantId, NotificationChannel channel, CancellationToken ct = default);
    Task AddAsync(NotificationTemplate template, CancellationToken ct = default);
    Task UpdateAsync(NotificationTemplate template, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
