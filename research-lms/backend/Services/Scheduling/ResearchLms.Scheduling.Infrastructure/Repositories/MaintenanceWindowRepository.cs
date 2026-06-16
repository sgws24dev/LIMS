using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class MaintenanceWindowRepository : IMaintenanceWindowRepository
{
    private readonly Persistence.SchedulingDbContext _db;

    public MaintenanceWindowRepository(Persistence.SchedulingDbContext db) => _db = db;

    public async Task<IEnumerable<MaintenanceWindow>> GetByResourceAndRangeAsync(
        Guid resourceId, DateTime from, DateTime to, CancellationToken ct) =>
        await _db.MaintenanceWindows
            .Where(m => m.ResourceId == resourceId && m.StartTime < to && m.EndTime > from)
            .ToListAsync(ct);

    public async Task<MaintenanceWindow?> GetByIdAsync(Guid id, CancellationToken ct) =>
        await _db.MaintenanceWindows.FindAsync([id], ct);

    public async Task<MaintenanceWindow> AddAsync(MaintenanceWindow window, CancellationToken ct)
    {
        _db.MaintenanceWindows.Add(window);
        await _db.SaveChangesAsync(ct);
        return window;
    }

    public async Task DeleteAsync(MaintenanceWindow window, CancellationToken ct)
    {
        _db.MaintenanceWindows.Remove(window);
        await _db.SaveChangesAsync(ct);
    }
}
