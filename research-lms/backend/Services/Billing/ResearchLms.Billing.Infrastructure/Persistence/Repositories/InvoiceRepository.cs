using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Infrastructure.Persistence.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly BillingDbContext _context;
    private readonly ITenantContext _tenantContext;

    public InvoiceRepository(BillingDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Invoice?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == id, ct);
    }

    public async Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber, CancellationToken ct = default)
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber, ct);
    }

    public async Task<IReadOnlyList<Invoice>> GetAllAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .Where(i => i.TenantId == tenantId)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Invoice>> GetByStatusAsync(Guid tenantId, string status, CancellationToken ct = default)
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .Where(i => i.TenantId == tenantId && i.Status.ToString() == status)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Invoice>> GetByBilledEntityAsync(Guid tenantId, string entityType, Guid entityId, CancellationToken ct = default)
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .Where(i => i.TenantId == tenantId && i.BilledToEntityType.ToString() == entityType && i.BilledToEntityId == entityId)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Invoice invoice, CancellationToken ct = default)
    {
        await _context.Invoices.AddAsync(invoice, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Invoice invoice, CancellationToken ct = default)
    {
        _context.Invoices.Update(invoice);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<InvoiceSequence?> GetSequenceAsync(Guid tenantId, int year, CancellationToken ct = default)
    {
        return await _context.InvoiceSequences
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Year == year, ct);
    }

    public async Task AddSequenceAsync(InvoiceSequence sequence, CancellationToken ct = default)
    {
        await _context.InvoiceSequences.AddAsync(sequence, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateSequenceAsync(InvoiceSequence sequence, CancellationToken ct = default)
    {
        _context.InvoiceSequences.Update(sequence);
        await _context.SaveChangesAsync(ct);
    }
}
