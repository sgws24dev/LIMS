using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Services.BackgroundJobs;

public class DailyRollupJob
{
    private readonly BillingDbContext _context;
    private readonly IAggregationRepository _aggregationRepository;

    public DailyRollupJob(BillingDbContext context, IAggregationRepository aggregationRepository)
    {
        _context = context;
        _aggregationRepository = aggregationRepository;
    }

    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var yesterday = DateTime.UtcNow.Date.AddDays(-1);

        var dailyRevenue = await _context.Invoices
            .Where(i => i.InvoiceDate.Date == yesterday && i.Status == InvoiceStatus.Paid)
            .SumAsync(i => (decimal?)i.TotalAmount) ?? 0;

        await UpsertMetricAsync(AggregationGranularity.Day, yesterday, "TotalRevenue", dailyRevenue, ct);

        var dailyBookings = await _context.Invoices
            .Where(i => i.InvoiceDate.Date == yesterday)
            .CountAsync(ct);

        await UpsertMetricAsync(AggregationGranularity.Day, yesterday, "TotalBookings", dailyBookings, ct);

        var avgInvoiceValue = dailyBookings > 0 ? dailyRevenue / dailyBookings : 0;
        await UpsertMetricAsync(AggregationGranularity.Day, yesterday, "AvgInvoiceValue", avgInvoiceValue, ct);

        var overdueAmount = await _context.Invoices
            .Where(i => i.Status == InvoiceStatus.Overdue)
            .SumAsync(i => (decimal?)i.BalanceDue) ?? 0;

        await UpsertMetricAsync(AggregationGranularity.Day, yesterday, "OverdueAmount", overdueAmount, ct);
    }

    private async Task UpsertMetricAsync(AggregationGranularity granularity, DateTime dateKey, string metricName, decimal metricValue, CancellationToken ct)
    {
        var row = new AggregationTable(granularity, dateKey, metricName, metricValue, "system");
        await _aggregationRepository.UpsertAsync(row, ct);
    }
}
