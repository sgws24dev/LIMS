using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IInvoiceGenerationService
{
    Task<Invoice> GenerateFromServiceRequestAsync(Guid serviceRequestId, string createdBy, CancellationToken ct = default);
    Task<Invoice> GenerateFromBookingAsync(Guid bookingId, string createdBy, CancellationToken ct = default);
    Task<Invoice> GenerateManualAsync(
        string billToName,
        string billToAddress,
        string billToEmail,
        List<(string description, decimal quantity, decimal unitPrice, decimal discountPercent, decimal taxRate, string? referenceType, Guid? referenceId)> lineItems,
        string createdBy,
        CancellationToken ct = default);
    Task<Invoice> PreviewFromServiceRequestAsync(Guid serviceRequestId, string createdBy, CancellationToken ct = default);
    Task<Invoice> PreviewFromBookingAsync(Guid bookingId, string createdBy, CancellationToken ct = default);
}
