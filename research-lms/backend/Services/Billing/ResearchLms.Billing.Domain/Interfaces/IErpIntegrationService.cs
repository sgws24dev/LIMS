using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public class ErpSyncResult
{
    public bool Success { get; }
    public string? ExternalId { get; }
    public string? ErrorMessage { get; }

    public ErpSyncResult(bool success, string? externalId = null, string? errorMessage = null)
    {
        Success = success;
        ExternalId = externalId;
        ErrorMessage = errorMessage;
    }
}

public interface IErpIntegrationService
{
    Task<ErpSyncResult> SendInvoiceAsync(Invoice invoice, CancellationToken ct = default);
    Task<ErpSyncResult> CheckStatusAsync(string externalId, CancellationToken ct = default);
    Task<ErpSyncResult> CreditNoteAsync(Invoice creditNote, CancellationToken ct = default);
}
