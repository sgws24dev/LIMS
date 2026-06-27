using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Queries.Invoices;

public class GetInvoicesQueryHandler : IRequestHandler<GetInvoicesQuery, (IReadOnlyList<InvoiceDto> Items, int TotalCount)>
{
    private readonly IInvoiceRepository _repository;
    private readonly ITenantContext _tenantContext;

    public GetInvoicesQueryHandler(IInvoiceRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<(IReadOnlyList<InvoiceDto> Items, int TotalCount)> Handle(GetInvoicesQuery request, CancellationToken ct)
    {
        var tenantId = _tenantContext.TenantId;
        var invoices = (await _repository.GetAllAsync(tenantId, ct)).AsEnumerable();

        if (!string.IsNullOrWhiteSpace(request.Status) && request.Status != "all")
            invoices = invoices.Where(i => i.Status.ToString().Equals(request.Status, StringComparison.OrdinalIgnoreCase));

        if (request.DateFrom.HasValue)
            invoices = invoices.Where(i => i.InvoiceDate >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            invoices = invoices.Where(i => i.InvoiceDate <= request.DateTo.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            invoices = invoices.Where(i =>
                i.InvoiceNumber.Contains(request.Search, StringComparison.OrdinalIgnoreCase) ||
                i.BillToName.Contains(request.Search, StringComparison.OrdinalIgnoreCase));

        var filtered = invoices.OrderByDescending(i => i.CreatedAt).ToList();
        var total = filtered.Count;
        var items = filtered.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize);

        var dtos = items.Select(invoice => new InvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            Status = invoice.Status.ToString(),
            BilledToEntityType = invoice.BilledToEntityType.ToString(),
            BilledToEntityId = invoice.BilledToEntityId,
            BillToName = invoice.BillToName,
            BillToAddress = invoice.BillToAddress,
            BillToEmail = invoice.BillToEmail,
            Currency = invoice.Currency,
            Subtotal = invoice.Subtotal,
            DiscountAmount = invoice.DiscountAmount,
            TaxAmount = invoice.TaxAmount,
            TotalAmount = invoice.TotalAmount,
            AmountPaid = invoice.AmountPaid,
            BalanceDue = invoice.BalanceDue,
            InvoiceDate = invoice.InvoiceDate,
            DueDate = invoice.DueDate,
            PaidAt = invoice.PaidAt,
            VoidedAt = invoice.VoidedAt,
            VoidReason = invoice.VoidReason,
            ErpSyncStatus = invoice.ErpSyncStatus.ToString(),
            CreditNoteForInvoiceId = invoice.CreditNoteForInvoiceId,
            CreatedAt = invoice.CreatedAt,
            LineItems = invoice.LineItems.Select(li => new InvoiceLineItemDto
            {
                Id = li.Id,
                Description = li.Description,
                Quantity = li.Quantity,
                UnitPrice = li.UnitPrice,
                DiscountPercent = li.DiscountPercent,
                TaxRate = li.TaxRate,
                LineTotal = li.LineTotal,
                ReferenceType = li.ReferenceType,
                ReferenceId = li.ReferenceId,
            }).ToList()
        }).ToList();

        return (dtos, total);
    }
}
