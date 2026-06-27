using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IPaymentReconciliationRepository
{
    Task<PaymentReconciliation?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<PaymentReconciliation>> GetByInvoiceIdAsync(Guid invoiceId, CancellationToken ct = default);
    Task<IReadOnlyList<PaymentReconciliation>> GetAllAsync(ReconciliationStatus? status = null, CancellationToken ct = default);
    Task AddAsync(PaymentReconciliation reconciliation, CancellationToken ct = default);
    Task UpdateAsync(PaymentReconciliation reconciliation, CancellationToken ct = default);
}
