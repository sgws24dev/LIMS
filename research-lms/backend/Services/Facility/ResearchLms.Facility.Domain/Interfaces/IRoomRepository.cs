using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Domain.Interfaces;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Room>> GetByFacilityIdAsync(Guid facilityId, CancellationToken ct = default);
    Task AddAsync(Room room, CancellationToken ct = default);
    Task UpdateAsync(Room room, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
