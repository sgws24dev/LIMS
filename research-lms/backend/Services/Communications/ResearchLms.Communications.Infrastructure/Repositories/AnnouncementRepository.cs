using Microsoft.EntityFrameworkCore;
using ResearchLms.Communications.Domain.Entities;
using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Communications.Domain.Interfaces;
using ResearchLms.Communications.Infrastructure.Persistence;

namespace ResearchLms.Communications.Infrastructure.Repositories;

public class AnnouncementRepository : IAnnouncementRepository
{
    private readonly CommunicationsDbContext _context;

    public AnnouncementRepository(CommunicationsDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Announcement>> GetAllAsync(
        Guid tenantId, string? audience = null, AnnouncementPriority? minPriority = null,
        DateTime? from = null, DateTime? to = null, CancellationToken ct = default)
    {
        var query = _context.Announcements
            .Where(a => a.TenantId == tenantId);

        if (!string.IsNullOrEmpty(audience))
            query = query.Where(a => a.TargetAudience == null || a.TargetAudience == audience);

        if (minPriority.HasValue)
            query = query.Where(a => a.Priority >= minPriority.Value);

        if (from.HasValue)
            query = query.Where(a => a.ValidFrom >= from.Value);

        if (to.HasValue)
            query = query.Where(a => a.ValidTo <= to.Value);

        return await query
            .OrderByDescending(a => a.Priority)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<Announcement?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Announcements.FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(Announcement announcement, CancellationToken ct)
    {
        await _context.Announcements.AddAsync(announcement, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Announcement announcement, CancellationToken ct)
    {
        _context.Announcements.Update(announcement);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var announcement = await _context.Announcements.FindAsync(new object[] { id }, ct);
        if (announcement is not null)
        {
            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync(ct);
        }
    }
}
