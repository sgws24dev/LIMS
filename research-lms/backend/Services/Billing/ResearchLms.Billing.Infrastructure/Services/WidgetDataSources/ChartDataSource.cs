using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.ValueObjects;
using ResearchLms.Billing.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Infrastructure.Services.WidgetDataSources;

public class ChartDataSource : WidgetDataSourceBase
{
    public override string WidgetType => "*";

    private readonly BillingDbContext _dbContext;
    private readonly ITenantContext _tenantContext;

    public ChartDataSource(BillingDbContext dbContext, ITenantContext tenantContext)
    {
        _dbContext = dbContext;
        _tenantContext = tenantContext;
    }

    public override async Task<WidgetData> GetDataAsync(string config, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var cfg = JsonSerializer.Deserialize<ChartConfigDto>(config) ?? new ChartConfigDto();
        var tenantId = _tenantContext.TenantId;

        return cfg.Metric switch
        {
            "revenueByMonth" => await GetGroupedRevenue(tenantId, from, to, cfg, ct),
            "revenueByCategory" => await GetRevenueByCategory(tenantId, from, to, ct),
            "bookingsByInstrument" => EmptyData(),
            "utilizationByFacility" => EmptyData(),
            "overdueByAging" => await GetOverdueByAging(tenantId, ct),
            _ => EmptyData(),
        };
    }

    private async Task<WidgetData> GetGroupedRevenue(Guid tenantId, DateTime from, DateTime to, ChartConfigDto cfg, CancellationToken ct)
    {
        var invoices = await _dbContext.Invoices
            .Where(i => i.TenantId == tenantId && i.Status == InvoiceStatus.Paid
                && i.InvoiceDate >= from && i.InvoiceDate <= to)
            .Select(i => new { i.InvoiceDate, i.TotalAmount })
            .ToListAsync(ct);

        if (invoices.Count == 0)
        {
            var emptyLabels = cfg.Granularity switch
            {
                "day" => GenerateDateLabels(from, to, "day"),
                "week" => GenerateDateLabels(from, to, "week"),
                "quarter" => GenerateDateLabels(from, to, "quarter"),
                _ => GenerateMonthLabels(from, to),
            };
            return new WidgetData(emptyLabels, new List<WidgetDataset> { new("Revenue", new List<decimal>(), cfg.Color) });
        }

        var grouped = cfg.Granularity switch
        {
            "day" => invoices.GroupBy(i => i.InvoiceDate.Date)
                .Select(g => new { Key = g.Key.ToString("yyyy-MM-dd"), Total = g.Sum(i => i.TotalAmount) })
                .OrderBy(x => x.Key),

            "week" => invoices.GroupBy(i => GetWeekStart(i.InvoiceDate))
                .Select(g => new { Key = g.Key.ToString("yyyy-MM-dd"), Total = g.Sum(i => i.TotalAmount) })
                .OrderBy(x => x.Key),

            "quarter" => invoices.GroupBy(i => new { i.InvoiceDate.Year, Quarter = (i.InvoiceDate.Month - 1) / 3 + 1 })
                .Select(g => new { Key = $"Q{g.Key.Quarter} {g.Key.Year}", Total = g.Sum(i => i.TotalAmount) })
                .OrderBy(x => x.Key),

            _ => invoices.GroupBy(i => new { i.InvoiceDate.Year, i.InvoiceDate.Month })
                .Select(g => new { Key = $"{g.Key.Year}-{g.Key.Month:D2}", Total = g.Sum(i => i.TotalAmount) })
                .OrderBy(x => x.Key),
        };

        var groupedList = grouped.ToList();
        return new WidgetData(
            groupedList.Select(x => x.Key).ToList(),
            new List<WidgetDataset> { new("Revenue", groupedList.Select(x => x.Total).ToList(), cfg.Color) });
    }

    private async Task<WidgetData> GetRevenueByCategory(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        var categoryData = await _dbContext.Invoices
            .Where(i => i.TenantId == tenantId && i.Status == InvoiceStatus.Paid
                && i.InvoiceDate >= from && i.InvoiceDate <= to)
            .GroupBy(i => i.BilledToEntityType.ToString())
            .Select(g => new
            {
                Category = g.Key,
                Total = g.Sum(i => i.TotalAmount)
            })
            .OrderByDescending(x => x.Total)
            .ToListAsync(ct);

        return new WidgetData(
            categoryData.Select(x => x.Category).ToList(),
            new List<WidgetDataset> { new("Revenue", categoryData.Select(x => x.Total).ToList(), "#3b82f6") });
    }

    private async Task<WidgetData> GetOverdueByAging(Guid tenantId, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var buckets = new[] { (0, 30), (31, 60), (61, 90), (91, 365) };
        var bucketLabels = new List<string> { "0-30 days", "31-60 days", "61-90 days", "90+ days" };
        var values = new List<decimal>();

        foreach (var (min, max) in buckets)
        {
            var total = await _dbContext.Invoices
                .Where(i => i.TenantId == tenantId
                    && i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Voided
                    && i.DueDate >= now.AddDays(-max) && i.DueDate < now.AddDays(-min + 1))
                .SumAsync(i => (decimal?)i.BalanceDue) ?? 0;
            values.Add(total);
        }

        return new WidgetData(bucketLabels, new List<WidgetDataset> { new("Overdue", values, "#ef4444") });
    }

    private static List<string> GenerateDateLabels(DateTime from, DateTime to, string granularity)
    {
        var labels = new List<string>();
        var current = granularity == "day" ? from.Date
            : granularity == "week" ? GetWeekStart(from)
            : new DateTime(from.Year, from.Month, 1);

        while (current <= to)
        {
            labels.Add(granularity switch
            {
                "day" => current.ToString("yyyy-MM-dd"),
                "week" => current.ToString("yyyy-MM-dd"),
                "quarter" => $"Q{(current.Month - 1) / 3 + 1} {current.Year}",
                _ => current.ToString("MMM yyyy"),
            });

            current = granularity switch
            {
                "day" => current.AddDays(1),
                "week" => current.AddDays(7),
                "quarter" => current.AddMonths(3),
                _ => current.AddMonths(1),
            };
        }
        return labels;
    }

    private static DateTime GetWeekStart(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-diff).Date;
    }

    private static WidgetData EmptyData()
    {
        return new WidgetData(new List<string>(), new List<WidgetDataset>());
    }

    private class ChartConfigDto
    {
        public string Metric { get; set; } = "revenueByMonth";
        public string Aggregation { get; set; } = "sum";
        public string Granularity { get; set; } = "month";
        public string Color { get; set; } = "#3b82f6";
    }
}
