using ResearchLms.Communications.Domain.Entities;

namespace ResearchLms.Communications.Domain.Interfaces;

public interface INotificationPreferenceRepository
{
    Task<IReadOnlyList<NotificationPreference>> GetUserPreferencesAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<NotificationPreference?> GetByTypeAsync(Guid tenantId, Guid userId, string notificationType, CancellationToken ct = default);
    Task AddAsync(NotificationPreference preference, CancellationToken ct = default);
    Task UpdateAsync(NotificationPreference preference, CancellationToken ct = default);
    Task SeedDefaultsAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
}
