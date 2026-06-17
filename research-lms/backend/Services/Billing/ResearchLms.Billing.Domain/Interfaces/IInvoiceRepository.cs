using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber, CancellationToken ct = default);
    Task<IReadOnlyList<Invoice>> GetAllAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<Invoice>> GetByStatusAsync(Guid tenantId, string status, CancellationToken ct = default);
    Task<IReadOnlyList<Invoice>> GetByBilledEntityAsync(Guid tenantId, string entityType, Guid entityId, CancellationToken ct = default);
    Task AddAsync(Invoice invoice, CancellationToken ct = default);
    Task UpdateAsync(Invoice invoice, CancellationToken ct = default);
    Task<InvoiceSequence?> GetSequenceAsync(Guid tenantId, int year, CancellationToken ct = default);
    Task AddSequenceAsync(InvoiceSequence sequence, CancellationToken ct = default);
    Task UpdateSequenceAsync(InvoiceSequence sequence, CancellationToken ct = default);
}
