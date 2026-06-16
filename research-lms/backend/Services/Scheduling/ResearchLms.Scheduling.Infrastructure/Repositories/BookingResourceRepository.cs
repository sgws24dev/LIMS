using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class BookingResourceRepository : IBookingResourceRepository
{
    private readonly SchedulingDbContext _db;

    public BookingResourceRepository(SchedulingDbContext db)
    {
        _db = db;
    }

    public async Task<BookingResource?> GetByResourceIdAsync(Guid resourceId, CancellationToken ct)
    {
        return await _db.BookingResources
            .FirstOrDefaultAsync(r => r.ResourceId == resourceId, ct);
    }

    public async Task UpsertAsync(BookingResource resource, CancellationToken ct)
    {
        var existing = await _db.BookingResources
            .FirstOrDefaultAsync(r => r.ResourceId == resource.ResourceId, ct);

        if (existing is not null)
        {
            existing.Name = resource.Name;
            existing.Identifier = resource.Identifier;
            existing.ResourceType = resource.ResourceType;
            existing.Location = resource.Location;
            existing.FacilityId = resource.FacilityId;
            existing.FacilityName = resource.FacilityName;
            existing.HourlyRate = resource.HourlyRate;
            existing.IsActive = resource.IsActive;
            existing.LastSyncedAt = resource.LastSyncedAt;
        }
        else
        {
            _db.BookingResources.Add(resource);
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task DeactivateAsync(Guid resourceId, CancellationToken ct)
    {
        var existing = await _db.BookingResources
            .FirstOrDefaultAsync(r => r.ResourceId == resourceId, ct);

        if (existing is not null)
        {
            existing.IsActive = false;
            existing.LastSyncedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<IEnumerable<BookingResource>> SearchAsync(
        string? query, ResourceType? type, Guid? tenantId, CancellationToken ct)
    {
        var q = _db.BookingResources.AsQueryable();

        if (type.HasValue)
            q = q.Where(r => r.ResourceType == type.Value);
        if (tenantId.HasValue)
            q = q.Where(r => r.TenantId == tenantId.Value);
        if (!string.IsNullOrWhiteSpace(query))
        {
            var search = query.ToLower();
            q = q.Where(r =>
                r.Name.ToLower().Contains(search) ||
                r.Identifier.ToLower().Contains(search));
        }

        return await q
            .Where(r => r.IsActive)
            .OrderBy(r => r.Name)
            .ToListAsync(ct);
    }
}
