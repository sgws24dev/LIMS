using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Infrastructure.Persistence.Repositories;

public class AggregationRepository : IAggregationRepository
{
    private readonly BillingDbContext _context;

    public AggregationRepository(BillingDbContext context)
    {
        _context = context;
    }

    public async Task<AggregationTable?> GetAsync(AggregationGranularity granularity, DateTime dateKey, string metricName, CancellationToken ct = default)
    {
        return await _context.AggregationTables
            .FirstOrDefaultAsync(a =>
                a.Granularity == granularity &&
                a.DateKey == dateKey &&
                a.MetricName == metricName, ct);
    }

    public async Task UpsertAsync(AggregationTable row, CancellationToken ct = default)
    {
        var existing = await GetAsync(row.Granularity, row.DateKey, row.MetricName, ct);
        if (existing != null)
        {
            existing.UpdateValue(row.MetricValue, row.CreatedBy);
            _context.AggregationTables.Update(existing);
        }
        else
        {
            await _context.AggregationTables.AddAsync(row, ct);
        }
        await _context.SaveChangesAsync(ct);
    }

    public async Task<List<AggregationTable>> GetByDateRangeAsync(AggregationGranularity granularity, DateTime from, DateTime to, CancellationToken ct = default)
    {
        return await _context.AggregationTables
            .Where(a =>
                a.Granularity == granularity &&
                a.DateKey >= from &&
                a.DateKey <= to)
            .OrderBy(a => a.DateKey)
            .ToListAsync(ct);
    }
}
