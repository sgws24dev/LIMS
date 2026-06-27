using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Services.BackgroundJobs;

public class WeeklyRollupJob
{
    private readonly BillingDbContext _context;
    private readonly IAggregationRepository _aggregationRepository;

    public WeeklyRollupJob(BillingDbContext context, IAggregationRepository aggregationRepository)
    {
        _context = context;
        _aggregationRepository = aggregationRepository;
    }

    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var endOfWeek = DateTime.UtcNow.Date.AddDays(-1);
        var startOfWeek = endOfWeek.AddDays(-6);

        var weeklyRevenue = await _context.Invoices
            .Where(i => i.InvoiceDate.Date >= startOfWeek && i.InvoiceDate.Date <= endOfWeek && i.Status == InvoiceStatus.Paid)
            .SumAsync(i => (decimal?)i.TotalAmount) ?? 0;

        var weekStart = startOfWeek;
        await UpsertMetricAsync(AggregationGranularity.Week, weekStart, "WeeklyRevenue", weeklyRevenue, ct);

        var weeklyBookings = await _context.Invoices
            .Where(i => i.InvoiceDate.Date >= startOfWeek && i.InvoiceDate.Date <= endOfWeek)
            .CountAsync(ct);

        await UpsertMetricAsync(AggregationGranularity.Week, weekStart, "WeeklyBookings", weeklyBookings, ct);

        var dailyRevenues = await _context.Invoices
            .Where(i => i.InvoiceDate.Date >= startOfWeek && i.InvoiceDate.Date <= endOfWeek && i.Status == InvoiceStatus.Paid)
            .GroupBy(i => i.InvoiceDate.Date)
            .Select(g => g.Sum(i => i.TotalAmount))
            .ToListAsync(ct);

        if (dailyRevenues.Count > 0)
        {
            var movingAvg = dailyRevenues.Average();
            await UpsertMetricAsync(AggregationGranularity.Week, weekStart, "DailyRevenueMovingAvg7d", movingAvg, ct);
        }
    }

    private async Task UpsertMetricAsync(AggregationGranularity granularity, DateTime dateKey, string metricName, decimal metricValue, CancellationToken ct)
    {
        var row = new AggregationTable(granularity, dateKey, metricName, metricValue, "system");
        await _aggregationRepository.UpsertAsync(row, ct);
    }
}
