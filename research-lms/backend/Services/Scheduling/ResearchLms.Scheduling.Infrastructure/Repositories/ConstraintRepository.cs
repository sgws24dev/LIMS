using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class ConstraintRepository : IConstraintRepository
{
    private readonly Persistence.SchedulingDbContext _db;

    public ConstraintRepository(Persistence.SchedulingDbContext db) => _db = db;

    public async Task<IEnumerable<Constraint>> GetActiveByResourceAsync(Guid resourceId, CancellationToken ct) =>
        await _db.Constraints.Where(c => c.ResourceId == resourceId && c.IsActive).ToListAsync(ct);

    public async Task<IEnumerable<Constraint>> GetByFilterAsync(Guid? resourceId, ConstraintType? type, CancellationToken ct)
    {
        var q = _db.Constraints.AsQueryable();
        if (resourceId.HasValue) q = q.Where(c => c.ResourceId == resourceId.Value);
        if (type.HasValue) q = q.Where(c => c.Type == type.Value);
        return await q.ToListAsync(ct);
    }

    public async Task<Constraint?> GetByIdAsync(Guid id, CancellationToken ct) =>
        await _db.Constraints.FindAsync([id], ct);

    public async Task<Constraint> AddAsync(Constraint constraint, CancellationToken ct)
    {
        _db.Constraints.Add(constraint);
        await _db.SaveChangesAsync(ct);
        return constraint;
    }

    public async Task UpdateAsync(Constraint constraint, CancellationToken ct)
    {
        _db.Constraints.Update(constraint);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Constraint constraint, CancellationToken ct)
    {
        _db.Constraints.Remove(constraint);
        await _db.SaveChangesAsync(ct);
    }
}
