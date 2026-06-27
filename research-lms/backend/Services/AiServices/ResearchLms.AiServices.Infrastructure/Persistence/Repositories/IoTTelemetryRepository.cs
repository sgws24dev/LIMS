using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class IoTTelemetryRepository : IIoTTelemetryRepository
{
    private readonly AiServicesDbContext _context;

    public IoTTelemetryRepository(AiServicesDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(IoTTelemetry telemetry, CancellationToken ct = default)
    {
        await _context.Set<IoTTelemetry>().AddAsync(telemetry, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<IoTTelemetry>> GetByInstrumentAsync(Guid tenantId, Guid instrumentId, string? metricName = null,
        DateTime? from = null, DateTime? to = null, int limit = 100, CancellationToken ct = default)
    {
        var query = _context.Set<IoTTelemetry>()
            .Where(t => t.TenantId == tenantId && t.InstrumentId == instrumentId);

        if (!string.IsNullOrEmpty(metricName))
            query = query.Where(t => t.MetricName == metricName);
        if (from.HasValue)
            query = query.Where(t => t.Timestamp >= from.Value);
        if (to.HasValue)
            query = query.Where(t => t.Timestamp <= to.Value);

        return await query.OrderByDescending(t => t.Timestamp).Take(limit).ToListAsync(ct);
    }

    public async Task<IoTTelemetry?> GetLatestAsync(Guid tenantId, Guid instrumentId, string metricName, CancellationToken ct = default)
    {
        return await _context.Set<IoTTelemetry>()
            .Where(t => t.TenantId == tenantId && t.InstrumentId == instrumentId && t.MetricName == metricName)
            .OrderByDescending(t => t.Timestamp)
            .FirstOrDefaultAsync(ct);
    }
}
