using Microsoft.EntityFrameworkCore;
using ResearchLms.Communications.Domain.Entities;
using ResearchLms.Communications.Domain.Interfaces;
using ResearchLms.Communications.Infrastructure.Persistence;

namespace ResearchLms.Communications.Infrastructure.Repositories;

public class NotificationPreferenceRepository : INotificationPreferenceRepository
{
    private readonly CommunicationsDbContext _context;

    private static readonly string[] DefaultTypes = {
        "CompetencyExpiry", "BookingReminder", "InvoicePaid", "Announcement", "SystemAlert"
    };

    public NotificationPreferenceRepository(CommunicationsDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<NotificationPreference>> GetUserPreferencesAsync(Guid tenantId, Guid userId, CancellationToken ct)
    {
        return await _context.NotificationPreferences
            .Where(p => p.TenantId == tenantId && p.UserId == userId)
            .ToListAsync(ct);
    }

    public async Task<NotificationPreference?> GetByTypeAsync(Guid tenantId, Guid userId, string notificationType, CancellationToken ct)
    {
        return await _context.NotificationPreferences
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.UserId == userId && p.NotificationType == notificationType, ct);
    }

    public async Task AddAsync(NotificationPreference preference, CancellationToken ct)
    {
        await _context.NotificationPreferences.AddAsync(preference, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(NotificationPreference preference, CancellationToken ct)
    {
        _context.NotificationPreferences.Update(preference);
        await _context.SaveChangesAsync(ct);
    }

    public async Task SeedDefaultsAsync(Guid tenantId, Guid userId, CancellationToken ct)
    {
        foreach (var type in DefaultTypes)
        {
            var exists = await _context.NotificationPreferences
                .AnyAsync(p => p.TenantId == tenantId && p.UserId == userId && p.NotificationType == type, ct);

            if (!exists)
            {
                var preference = new NotificationPreference(userId, type,
                    new[] { "Email", "InApp" }, false);
                preference.SetTenant(tenantId);
                await _context.NotificationPreferences.AddAsync(preference, ct);
            }
        }

        await _context.SaveChangesAsync(ct);
    }
}
