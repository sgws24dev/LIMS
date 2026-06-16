using Microsoft.EntityFrameworkCore;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Persistence;

public class TelemetryRepository : ITelemetryRepository
{
    private readonly ResearchLmsDbContext _context;

    public TelemetryRepository(ResearchLmsDbContext context)
    {
        _context = context;
    }

    public async Task<TelemetryRecord?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.TelemetryRecords
            .FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IReadOnlyList<TelemetryRecord>> GetLatestAsync(
        Guid instrumentId, int count = 100, CancellationToken ct = default)
    {
        return await _context.TelemetryRecords
            .Where(t => t.InstrumentId == instrumentId)
            .OrderByDescending(t => t.ReceivedAt)
            .Take(count)
            .ToListAsync(ct);
    }

    public async Task<TelemetryRecord?> GetLatestOneAsync(Guid instrumentId, CancellationToken ct = default)
        => await _context.TelemetryRecords
            .Where(t => t.InstrumentId == instrumentId)
            .OrderByDescending(t => t.ReceivedAt)
            .FirstOrDefaultAsync(ct);

    public async Task AddAsync(TelemetryRecord record, CancellationToken ct = default)
    {
        await _context.TelemetryRecords.AddAsync(record, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task AddBatchAsync(IEnumerable<TelemetryRecord> records, CancellationToken ct = default)
    {
        await _context.TelemetryRecords.AddRangeAsync(records, ct);
        await _context.SaveChangesAsync(ct);
    }
}
