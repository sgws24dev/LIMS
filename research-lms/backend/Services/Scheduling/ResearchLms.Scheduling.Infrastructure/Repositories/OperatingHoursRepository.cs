using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class OperatingHoursRepository : IOperatingHoursRepository
{
    private readonly SchedulingDbContext _db;

    public OperatingHoursRepository(SchedulingDbContext db) => _db = db;

    public async Task<ResourceOperatingHours?> GetByResourceIdAsync(Guid resourceId, CancellationToken ct) =>
        await _db.ResourceOperatingHours.FirstOrDefaultAsync(h => h.ResourceId == resourceId, ct);

    public async Task AddOrUpdateAsync(ResourceOperatingHours hours, CancellationToken ct)
    {
        var existing = await _db.ResourceOperatingHours
            .FirstOrDefaultAsync(h => h.ResourceId == hours.ResourceId, ct);
        if (existing is not null)
        {
            _db.Entry(existing).CurrentValues.SetValues(hours);
        }
        else
        {
            await _db.ResourceOperatingHours.AddAsync(hours, ct);
        }
        await _db.SaveChangesAsync(ct);
    }
}
