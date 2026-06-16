using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Domain.Interfaces;

public interface ICalibrationRepository
{
    Task<CalibrationRecord?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<CalibrationRecord> Items, int TotalCount)> GetAllAsync(
        Guid? instrumentId = null, string? status = null,
        int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task AddAsync(CalibrationRecord record, CancellationToken ct = default);
    Task UpdateAsync(CalibrationRecord record, CancellationToken ct = default);
    Task<IEnumerable<CalibrationRecord>> GetDueSoonAsync(int withinDays, CancellationToken ct = default);
    Task<IEnumerable<CalibrationRecord>> GetExpiredAsync(CancellationToken ct = default);
    Task<(int DueSoonCount, int ExpiredCount, int ValidCount)> GetSummaryAsync(CancellationToken ct = default);
}
