using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Services;

public class OracleFusionErpService : IErpIntegrationService
{
    private readonly BillingDbContext _context;

    public OracleFusionErpService(BillingDbContext context)
    {
        _context = context;
    }

    public async Task<ErpSyncResult> SendInvoiceAsync(Invoice invoice, CancellationToken ct = default)
    {
        var log = new ErpSyncLog(invoice.Id, "Outbound", SerializePayload(invoice), "system");
        await _context.ErpSyncLogs.AddAsync(log, ct);

        try
        {
            var externalId = $"ERP-{invoice.InvoiceNumber}-{Guid.NewGuid():N}"[..30];
            log.MarkSent("system");
            log.MarkAcknowledged($"{{\"externalId\":\"{externalId}\",\"status\":\"received\"}}", "system");
            await _context.SaveChangesAsync(ct);

            return new ErpSyncResult(true, externalId);
        }
        catch (Exception ex)
        {
            log.MarkFailed(ex.Message, "system");
            await _context.SaveChangesAsync(ct);
            return new ErpSyncResult(false, errorMessage: ex.Message);
        }
    }

    public async Task<ErpSyncResult> CheckStatusAsync(string externalId, CancellationToken ct = default)
    {
        await Task.Delay(100, ct);
        return new ErpSyncResult(true, externalId);
    }

    public async Task<ErpSyncResult> CreditNoteAsync(Invoice creditNote, CancellationToken ct = default)
    {
        var log = new ErpSyncLog(creditNote.Id, "Outbound", SerializePayload(creditNote), "system");
        await _context.ErpSyncLogs.AddAsync(log, ct);

        try
        {
            var externalId = $"CN-{creditNote.InvoiceNumber}-{Guid.NewGuid():N}"[..30];
            log.MarkSent("system");
            log.MarkAcknowledged($"{{\"externalId\":\"{externalId}\",\"status\":\"credit_note_received\"}}", "system");
            await _context.SaveChangesAsync(ct);

            return new ErpSyncResult(true, externalId);
        }
        catch (Exception ex)
        {
            log.MarkFailed(ex.Message, "system");
            await _context.SaveChangesAsync(ct);
            return new ErpSyncResult(false, errorMessage: ex.Message);
        }
    }

    private static string SerializePayload(Invoice invoice)
    {
        return System.Text.Json.JsonSerializer.Serialize(new
        {
            invoice.Id,
            invoice.InvoiceNumber,
            invoice.TotalAmount,
            invoice.Currency,
            invoice.BillToName,
            Lines = invoice.LineItems.Select(li => new
            {
                li.Description,
                li.Quantity,
                li.UnitPrice,
                li.LineTotal
            })
        }, new System.Text.Json.JsonSerializerOptions
        {
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
        });
    }
}
