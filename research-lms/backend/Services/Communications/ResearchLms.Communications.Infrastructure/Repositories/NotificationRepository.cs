using Microsoft.EntityFrameworkCore;
using ResearchLms.Communications.Domain.Entities;
using ResearchLms.Communications.Domain.Interfaces;
using ResearchLms.Communications.Infrastructure.Persistence;

namespace ResearchLms.Communications.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly CommunicationsDbContext _context;

    public NotificationRepository(CommunicationsDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Notification>> GetUserNotificationsAsync(
        Guid tenantId, Guid userId, bool? unreadOnly = null, string? type = null,
        int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var query = _context.Notifications
            .Where(n => n.TenantId == tenantId && n.UserId == userId);

        if (unreadOnly == true)
            query = query.Where(n => !n.IsRead);

        if (!string.IsNullOrEmpty(type))
            query = query.Where(n => n.Type == type);

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> GetUnreadCountAsync(Guid tenantId, Guid userId, CancellationToken ct)
    {
        return await _context.Notifications
            .CountAsync(n => n.TenantId == tenantId && n.UserId == userId && !n.IsRead, ct);
    }

    public async Task<Notification?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Notifications.FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(Notification notification, CancellationToken ct)
    {
        await _context.Notifications.AddAsync(notification, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task AddRangeAsync(IEnumerable<Notification> notifications, CancellationToken ct)
    {
        await _context.Notifications.AddRangeAsync(notifications, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task MarkAsReadAsync(Guid id, CancellationToken ct)
    {
        var notification = await _context.Notifications.FindAsync(new object[] { id }, ct);
        if (notification is not null)
        {
            notification.MarkAsRead();
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task MarkAllAsReadAsync(Guid tenantId, Guid userId, CancellationToken ct)
    {
        var unread = await _context.Notifications
            .Where(n => n.TenantId == tenantId && n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var notification in unread)
            notification.MarkAsRead();

        await _context.SaveChangesAsync(ct);
    }
}
