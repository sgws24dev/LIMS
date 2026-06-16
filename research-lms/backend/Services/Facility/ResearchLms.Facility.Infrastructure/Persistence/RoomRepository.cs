using Microsoft.EntityFrameworkCore;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Persistence;

public class RoomRepository : IRoomRepository
{
    private readonly ResearchLmsDbContext _context;

    public RoomRepository(ResearchLmsDbContext context) => _context = context;

    public async Task<Room?> GetByIdAsync(Guid id, CancellationToken ct)
        => await _context.Set<Room>().FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IReadOnlyList<Room>> GetByFacilityIdAsync(Guid facilityId, CancellationToken ct)
        => await _context.Set<Room>().Where(r => r.FacilityId == facilityId).OrderBy(r => r.Name).ToListAsync(ct);

    public async Task AddAsync(Room room, CancellationToken ct)
        => await _context.Set<Room>().AddAsync(room, ct);

    public Task UpdateAsync(Room room, CancellationToken ct)
    {
        _context.Set<Room>().Update(room);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var room = await GetByIdAsync(id, ct);
        if (room is not null)
            _context.Set<Room>().Remove(room);
    }
}
