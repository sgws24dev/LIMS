namespace ResearchLms.Billing.Domain.Interfaces;

public interface IInvoicePdfService
{
    Task<byte[]> GeneratePdfAsync(Guid invoiceId, CancellationToken ct = default);
    Task<string> GetPdfCacheKeyAsync(Guid invoiceId);
}
