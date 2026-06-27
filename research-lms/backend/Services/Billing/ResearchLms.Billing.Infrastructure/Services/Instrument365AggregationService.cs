using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Domain.ValueObjects;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Services;

public class Instrument365AggregationService : IInstrument365Service
{
    private readonly BillingDbContext _dbContext;

    public Instrument365AggregationService(BillingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Instrument365Data> GetInstrument365DataAsync(Guid tenantId, Guid instrumentId, int year, CancellationToken ct = default)
    {
        var from = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        var invoices = await _dbContext.Invoices
            .Where(i => i.TenantId == tenantId
                && i.BilledToEntityId == instrumentId
                && i.InvoiceDate >= from && i.InvoiceDate <= to)
            .ToListAsync(ct);

        var dailyMap = new Dictionary<DateOnly, InstrumentDailyMetric>();
        var start = DateOnly.FromDateTime(from);
        var end = DateOnly.FromDateTime(to);

        for (var d = start; d <= end; d = d.AddDays(1))
        {
            dailyMap[d] = new InstrumentDailyMetric(d.ToDateTime(TimeOnly.MinValue), 0, 0m, 24m, 0m, 0m, 0, 0m);
        }

        foreach (var invoice in invoices)
        {
            var dateKey = DateOnly.FromDateTime(invoice.InvoiceDate);
            if (!dailyMap.TryGetValue(dateKey, out var existing)) continue;

            dailyMap[dateKey] = new InstrumentDailyMetric(
                existing.Date,
                existing.TotalBookings,
                existing.UtilizedHours,
                existing.IdleHours,
                existing.DowntimeHours,
                existing.RevenueGenerated + invoice.TotalAmount,
                existing.ServiceEventCount,
                existing.MaintenanceHours);
        }

        var dailyMetrics = dailyMap.OrderBy(x => x.Key).Select(x => x.Value).ToList();

        var totalRevenue = dailyMetrics.Sum(m => m.RevenueGenerated);
        var totalUtilizedHours = dailyMetrics.Sum(m => m.UtilizedHours);
        var totalDowntimeHours = dailyMetrics.Sum(m => m.DowntimeHours);
        var totalHours = dailyMetrics.Count * 24m;
        var totalBookings = dailyMetrics.Sum(m => m.TotalBookings);

        var utilizationPercent = totalHours > 0 ? (double)(totalUtilizedHours / totalHours) * 100 : 0;
        var downtimePercent = totalHours > 0 ? (double)(totalDowntimeHours / totalHours) * 100 : 0;
        var avgBookingsPerDay = dailyMetrics.Count > 0 ? (double)totalBookings / dailyMetrics.Count : 0;

        var topMonth = dailyMetrics
            .GroupBy(m => m.Date.Month)
            .OrderByDescending(g => g.Sum(m => m.ServiceEventCount))
            .Select(g => new DateTime(year, g.Key, 1).ToString("MMMM"))
            .FirstOrDefault() ?? "N/A";

        var summary = new Instrument365Summary(
            totalRevenue,
            Math.Round(utilizationPercent, 1),
            Math.Round(downtimePercent, 1),
            Math.Round(avgBookingsPerDay, 1),
            topMonth);

        return new Instrument365Data(dailyMetrics, summary);
    }
}
