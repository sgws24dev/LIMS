using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Invoices;

public class GetInvoiceByIdQueryHandler : IRequestHandler<GetInvoiceByIdQuery, InvoiceDto?>
{
    private readonly IInvoiceRepository _repository;

    public GetInvoiceByIdQueryHandler(IInvoiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<InvoiceDto?> Handle(GetInvoiceByIdQuery request, CancellationToken ct)
    {
        var invoice = await _repository.GetByIdAsync(request.Id, ct);
        if (invoice == null) return null;

        return new InvoiceDto
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
        };
    }
}
