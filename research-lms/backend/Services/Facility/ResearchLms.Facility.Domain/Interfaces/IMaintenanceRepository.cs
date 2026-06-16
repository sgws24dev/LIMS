using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Domain.Interfaces;

public interface IMaintenanceRepository
{
    Task<MaintenanceRecord?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<MaintenanceRecord> Items, int TotalCount)> GetAllAsync(
        Guid? assetId = null, string? status = null,
        DateOnly? dateFrom = null, DateOnly? dateTo = null,
        int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<IEnumerable<MaintenanceRecord>> GetCalendarAsync(int month, int year, Guid? facilityId, CancellationToken ct = default);
    Task AddAsync(MaintenanceRecord record, CancellationToken ct = default);
    Task UpdateAsync(MaintenanceRecord record, CancellationToken ct = default);
    Task<IEnumerable<MaintenanceRecord>> GetOverdueRecordsAsync(CancellationToken ct = default);
    Task<IEnumerable<MaintenanceRecord>> GetScheduledRecordsForDateAsync(DateOnly date, CancellationToken ct = default);
}
