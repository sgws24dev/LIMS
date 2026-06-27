using ResearchLms.Communications.Domain.Entities;

namespace ResearchLms.Communications.Domain.Interfaces;

public interface INotificationRepository
{
    Task<IReadOnlyList<Notification>> GetUserNotificationsAsync(Guid tenantId, Guid userId, bool? unreadOnly = null, string? type = null, int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Notification notification, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<Notification> notifications, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid id, CancellationToken ct = default);
    Task MarkAllAsReadAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
}
