using Microsoft.EntityFrameworkCore;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Persistence;

public class FacilityRepository : IFacilityRepository
{
    private readonly ResearchLmsDbContext _context;

    public FacilityRepository(ResearchLmsDbContext context) => _context = context;

    public async Task<Facility?> GetByIdAsync(Guid id, CancellationToken ct)
        => await _context.Set<Facility>().FirstOrDefaultAsync(f => f.Id == id, ct);

    public async Task<(IReadOnlyList<Facility> Items, int TotalCount)> GetAllAsync(
        string? search, string? type, int page, int pageSize, CancellationToken ct)
    {
        var query = _context.Set<Facility>().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(f => f.Name.Contains(search));
        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(f => f.Type == type);
        var totalCount = await query.CountAsync(ct);
        var items = await query.OrderBy(f => f.Name)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(ct);
        return (items, totalCount);
    }

    public async Task AddAsync(Facility facility, CancellationToken ct)
        => await _context.Set<Facility>().AddAsync(facility, ct);

    public Task UpdateAsync(Facility facility, CancellationToken ct)
    {
        _context.Set<Facility>().Update(facility);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var facility = await GetByIdAsync(id, ct);
        if (facility is not null)
            _context.Set<Facility>().Remove(facility);
    }
}
