using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IInvoiceGenerationService
{
    Task<Invoice> GenerateFromServiceRequestAsync(Guid serviceRequestId, Guid? pricingModelId, string customerType, string createdBy, CancellationToken ct = default);
    Task<Invoice> GenerateFromBookingAsync(Guid bookingId, Guid? pricingModelId, string customerType, string createdBy, CancellationToken ct = default);
    Task<Invoice> GenerateManualAsync(
        string billToName,
        string billToAddress,
        string billToEmail,
        List<(string description, decimal quantity, decimal unitPrice, decimal discountPercent, decimal taxRate, string? referenceType, Guid? referenceId)> lineItems,
        string createdBy,
        CancellationToken ct = default);
    Task<Invoice> GeneratePricedManualAsync(
        string billToName,
        string billToAddress,
        string billToEmail,
        string currency,
        Guid? pricingModelId,
        string customerType,
        decimal quantity,
        int? duration,
        string createdBy,
        CancellationToken ct = default);
    Task<Invoice> PreviewFromServiceRequestAsync(Guid serviceRequestId, Guid? pricingModelId, string customerType, string createdBy, CancellationToken ct = default);
    Task<Invoice> PreviewFromBookingAsync(Guid bookingId, Guid? pricingModelId, string customerType, string createdBy, CancellationToken ct = default);
}
