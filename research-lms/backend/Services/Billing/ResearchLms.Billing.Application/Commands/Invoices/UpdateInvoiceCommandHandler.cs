using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Commands.Invoices;

public class UpdateInvoiceCommandHandler : IRequestHandler<UpdateInvoiceCommand, InvoiceDto>
{
    private readonly IInvoiceRepository _repository;
    private readonly ITenantContext _tenantContext;

    public UpdateInvoiceCommandHandler(IInvoiceRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<InvoiceDto> Handle(UpdateInvoiceCommand request, CancellationToken ct)
    {
        var invoice = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Invoice {request.Id} not found.");

        if (invoice.Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Only draft invoices can be updated.");

        var updatedItems = request.LineItems.Select(item => new InvoiceLineItem(
            invoice.Id,
            item.Description,
            item.Quantity,
            item.UnitPrice,
            item.DiscountPercent,
            item.TaxRate,
            item.ReferenceType,
            item.ReferenceId,
            "system")).ToList();

        invoice.UpdateLineItems(updatedItems);
        invoice.MarkUpdated("system");

        await _repository.UpdateAsync(invoice, ct);

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
