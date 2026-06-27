using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.BackgroundJobs;

public class ErpSyncJob
{
    private readonly BillingDbContext _context;
    private readonly IErpIntegrationService _erpService;
    private readonly ILogger<ErpSyncJob> _logger;

    public ErpSyncJob(BillingDbContext context, IErpIntegrationService erpService, ILogger<ErpSyncJob> logger)
    {
        _context = context;
        _erpService = erpService;
        _logger = logger;
    }

    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var pendingInvoices = await _context.Invoices
            .Where(i => i.ErpSyncStatus == ErpSyncStatus.Pending || i.ErpSyncStatus == ErpSyncStatus.Failed)
            .Where(i => i.Status == InvoiceStatus.Approved || i.Status == InvoiceStatus.Sent || i.Status == InvoiceStatus.Paid)
            .Include(i => i.LineItems)
            .ToListAsync(ct);

        _logger.LogInformation("ERP sync job found {Count} invoices to process", pendingInvoices.Count);

        foreach (var invoice in pendingInvoices)
        {
            var recentLogs = await _context.ErpSyncLogs
                .Where(l => l.InvoiceId == invoice.Id && l.Status == ErpSyncStatus.Failed)
                .OrderByDescending(l => l.LastAttemptedAt)
                .ToListAsync(ct);

            if (recentLogs.Count >= 5)
            {
                _logger.LogWarning("Invoice {InvoiceNumber} has exceeded max retry attempts", invoice.InvoiceNumber);
                continue;
            }

            if (recentLogs.Count > 0)
            {
                var lastAttempt = recentLogs.First().LastAttemptedAt;
                var backoffDelay = TimeSpan.FromMinutes(Math.Pow(2, recentLogs.Count - 1) * 5);
                if (lastAttempt.HasValue && DateTime.UtcNow - lastAttempt.Value < backoffDelay)
                {
                    _logger.LogInformation("Invoice {InvoiceNumber} waiting for backoff ({Minutes}m before next retry)", invoice.InvoiceNumber, backoffDelay.TotalMinutes);
                    continue;
                }
            }

            try
            {
                var result = await _erpService.SendInvoiceAsync(invoice, ct);
                if (result.Success)
                {
                    invoice.SetErpSyncStatus(ErpSyncStatus.Acknowledged, "system");
                    _logger.LogInformation("Invoice {InvoiceNumber} synced to ERP successfully", invoice.InvoiceNumber);
                }
                else
                {
                    invoice.SetErpSyncStatus(ErpSyncStatus.Failed, "system");
                    _logger.LogWarning("Invoice {InvoiceNumber} ERP sync failed: {Error}", invoice.InvoiceNumber, result.ErrorMessage);
                }
            }
            catch (Exception ex)
            {
                invoice.SetErpSyncStatus(ErpSyncStatus.Failed, "system");
                _logger.LogError(ex, "Error syncing invoice {InvoiceNumber} to ERP", invoice.InvoiceNumber);
            }
        }

        await _context.SaveChangesAsync(ct);
    }
}
