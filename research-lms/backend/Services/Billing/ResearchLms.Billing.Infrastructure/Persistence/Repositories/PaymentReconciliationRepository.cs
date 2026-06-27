using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Persistence.Repositories;

public class PaymentReconciliationRepository : IPaymentReconciliationRepository
{
    private readonly BillingDbContext _context;

    public PaymentReconciliationRepository(BillingDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentReconciliation?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.PaymentReconciliations.FindAsync(new object[] { id }, ct);
    }

    public async Task<IReadOnlyList<PaymentReconciliation>> GetByInvoiceIdAsync(Guid invoiceId, CancellationToken ct = default)
    {
        return await _context.PaymentReconciliations
            .Where(r => r.InvoiceId == invoiceId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<PaymentReconciliation>> GetAllAsync(ReconciliationStatus? status = null, CancellationToken ct = default)
    {
        var query = _context.PaymentReconciliations.AsQueryable();
        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);
        return await query.OrderByDescending(r => r.CreatedAt).ToListAsync(ct);
    }

    public async Task AddAsync(PaymentReconciliation reconciliation, CancellationToken ct = default)
    {
        await _context.PaymentReconciliations.AddAsync(reconciliation, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(PaymentReconciliation reconciliation, CancellationToken ct = default)
    {
        _context.PaymentReconciliations.Update(reconciliation);
        await _context.SaveChangesAsync(ct);
    }
}
