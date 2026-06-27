using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Services.BackgroundJobs;

public class MonthlyRollupJob
{
    private readonly BillingDbContext _context;
    private readonly IAggregationRepository _aggregationRepository;

    public MonthlyRollupJob(BillingDbContext context, IAggregationRepository aggregationRepository)
    {
        _context = context;
        _aggregationRepository = aggregationRepository;
    }

    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var lastMonth = now.AddMonths(-1);
        var monthStart = new DateTime(lastMonth.Year, lastMonth.Month, 1);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);

        var monthlyRevenue = await _context.Invoices
            .Where(i => i.InvoiceDate.Date >= monthStart && i.InvoiceDate.Date <= monthEnd && i.Status == InvoiceStatus.Paid)
            .SumAsync(i => (decimal?)i.TotalAmount) ?? 0;

        await UpsertMetricAsync(AggregationGranularity.Month, monthStart, "MonthlyRevenue", monthlyRevenue, ct);

        var monthlyBookings = await _context.Invoices
            .Where(i => i.InvoiceDate.Date >= monthStart && i.InvoiceDate.Date <= monthEnd)
            .CountAsync(ct);

        await UpsertMetricAsync(AggregationGranularity.Month, monthStart, "MonthlyBookings", monthlyBookings, ct);

        var monthlyOverdue = await _context.Invoices
            .Where(i => i.Status == InvoiceStatus.Overdue)
            .SumAsync(i => (decimal?)i.BalanceDue) ?? 0;

        await UpsertMetricAsync(AggregationGranularity.Month, monthStart, "MonthlyOverdueEnding", monthlyOverdue, ct);

        var lastYearStart = monthStart.AddYears(-1);
        var lastYearEnd = monthEnd.AddYears(-1);

        var previousYearRevenue = await _context.Invoices
            .Where(i => i.InvoiceDate.Date >= lastYearStart && i.InvoiceDate.Date <= lastYearEnd && i.Status == InvoiceStatus.Paid)
            .SumAsync(i => (decimal?)i.TotalAmount) ?? 0;

        var revenueChange = previousYearRevenue > 0
            ? ((monthlyRevenue - previousYearRevenue) / previousYearRevenue) * 100
            : 0;

        await UpsertMetricAsync(AggregationGranularity.Month, monthStart, "RevenueYoYChangePercent", Math.Round(revenueChange, 2), ct);
    }

    private async Task UpsertMetricAsync(AggregationGranularity granularity, DateTime dateKey, string metricName, decimal metricValue, CancellationToken ct)
    {
        var row = new AggregationTable(granularity, dateKey, metricName, metricValue, "system");
        await _aggregationRepository.UpsertAsync(row, ct);
    }
}
