using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.ValueObjects;
using ResearchLms.Billing.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Infrastructure.Services.WidgetDataSources;

public class KpiDataSource : WidgetDataSourceBase
{
    public override string WidgetType => "Kpi";

    private readonly BillingDbContext _dbContext;
    private readonly ITenantContext _tenantContext;

    public KpiDataSource(BillingDbContext dbContext, ITenantContext tenantContext)
    {
        _dbContext = dbContext;
        _tenantContext = tenantContext;
    }

    public override async Task<WidgetData> GetDataAsync(string config, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var cfg = JsonSerializer.Deserialize<KpiConfigDto>(config) ?? new KpiConfigDto();
        var tenantId = _tenantContext.TenantId;

        var periodSpan = to - from;
        var midPoint = from.AddDays((int)(periodSpan.TotalDays / 2));

        var currentValue = await GetMetricValue(cfg.Metric, tenantId, midPoint, to, ct);
        var previousValue = cfg.ShowComparison
            ? await GetMetricValue(cfg.Metric, tenantId, from, midPoint, ct)
            : 0m;

        var changePercent = cfg.ShowComparison && previousValue != 0
            ? Math.Round((currentValue - previousValue) / previousValue * 100, 1)
            : (decimal?)null;

        var trendDirection = changePercent.HasValue
            ? changePercent.Value > 1 ? "up" : changePercent.Value < -1 ? "down" : "flat"
            : null;

        var labels = new List<string> { "current", "previous" };
        var datasets = new List<WidgetDataset>
        {
            new("current", new List<decimal> { currentValue }, "#3b82f6"),
        };

        if (cfg.ShowComparison)
        {
            datasets.Add(new("previous", new List<decimal> { previousValue }, "#94a3b8"));
        }

        return new WidgetData(labels, datasets, changePercent, trendDirection);
    }

    private async Task<decimal> GetMetricValue(string metric, Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        return metric switch
        {
            "totalRevenue" => await _dbContext.Invoices
                .Where(i => i.TenantId == tenantId && i.Status == InvoiceStatus.Paid
                    && i.InvoiceDate >= from && i.InvoiceDate <= to)
                .SumAsync(i => (decimal?)i.TotalAmount, ct) ?? 0,

            "outstandingReceivables" => await _dbContext.Invoices
                .Where(i => i.TenantId == tenantId
                    && i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Voided)
                .SumAsync(i => (decimal?)i.BalanceDue, ct) ?? 0,

            "overdueAmount" => await _dbContext.Invoices
                .Where(i => i.TenantId == tenantId
                    && i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Voided
                    && i.DueDate < DateTime.UtcNow)
                .SumAsync(i => (decimal?)i.BalanceDue, ct) ?? 0,

            "avgDaysToPay" => await GetAvgDaysToPay(tenantId, from, to, ct),

            "utilizationRate" => 0m,

            "activeBookings" => await _dbContext.Invoices
                .Where(i => i.TenantId == tenantId && i.Status == InvoiceStatus.Pending)
                .CountAsync(ct),

            "pendingServiceRequests" => 0m,

            _ => 0m,
        };
    }

    private async Task<decimal> GetAvgDaysToPay(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        var paidInvoices = await _dbContext.Invoices
            .Where(i => i.TenantId == tenantId && i.Status == InvoiceStatus.Paid
                && i.PaidAt != null && i.InvoiceDate >= from && i.InvoiceDate <= to)
            .Select(i => (i.PaidAt!.Value - i.InvoiceDate).Days)
            .ToListAsync(ct);

        return paidInvoices.Count > 0 ? (decimal)paidInvoices.Average() : 0;
    }

    private class KpiConfigDto
    {
        public string Metric { get; set; } = "totalRevenue";
        public string Format { get; set; } = "currency";
        public bool ShowComparison { get; set; }
    }
}
