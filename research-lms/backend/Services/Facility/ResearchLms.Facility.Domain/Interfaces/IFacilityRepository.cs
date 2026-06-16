using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Domain.Interfaces;

public interface IFacilityRepository
{
    Task<Facility?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<Facility> Items, int TotalCount)> GetAllAsync(string? search = null, string? type = null, int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task AddAsync(Facility facility, CancellationToken ct = default);
    Task UpdateAsync(Facility facility, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
