using Microsoft.EntityFrameworkCore;
using ResearchLms.Communications.Domain.Entities;
using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Communications.Domain.Interfaces;
using ResearchLms.Communications.Infrastructure.Persistence;

namespace ResearchLms.Communications.Infrastructure.Repositories;

public class NotificationTemplateRepository : INotificationTemplateRepository
{
    private readonly CommunicationsDbContext _context;

    public NotificationTemplateRepository(CommunicationsDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<NotificationTemplate>> GetAllAsync(Guid tenantId, CancellationToken ct)
    {
        return await _context.NotificationTemplates
            .Where(t => t.TenantId == tenantId)
            .OrderBy(t => t.Name)
            .ToListAsync(ct);
    }

    public async Task<NotificationTemplate?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.NotificationTemplates.FindAsync(new object[] { id }, ct);
    }

    public async Task<NotificationTemplate?> GetDefaultAsync(Guid tenantId, NotificationChannel channel, CancellationToken ct)
    {
        return await _context.NotificationTemplates
            .FirstOrDefaultAsync(t => t.TenantId == tenantId && t.Channel == channel && t.IsDefault, ct);
    }

    public async Task AddAsync(NotificationTemplate template, CancellationToken ct)
    {
        await _context.NotificationTemplates.AddAsync(template, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(NotificationTemplate template, CancellationToken ct)
    {
        _context.NotificationTemplates.Update(template);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var template = await _context.NotificationTemplates.FindAsync(new object[] { id }, ct);
        if (template is not null)
        {
            _context.NotificationTemplates.Remove(template);
            await _context.SaveChangesAsync(ct);
        }
    }
}
