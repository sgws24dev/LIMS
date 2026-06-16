using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Domain.Interfaces;

public interface ITelemetryRepository
{
    Task<TelemetryRecord?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<TelemetryRecord>> GetLatestAsync(
        Guid instrumentId, int count = 100, CancellationToken ct = default);
    Task<TelemetryRecord?> GetLatestOneAsync(Guid instrumentId, CancellationToken ct = default);
    Task AddAsync(TelemetryRecord record, CancellationToken ct = default);
    Task AddBatchAsync(IEnumerable<TelemetryRecord> records, CancellationToken ct = default);
}
