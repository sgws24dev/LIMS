using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Commands.Invoices;

public class CreateInvoiceCommandHandler : IRequestHandler<CreateInvoiceCommand, InvoiceDto>
{
    private readonly IInvoiceRepository _repository;
    private readonly ITenantContext _tenantContext;

    public CreateInvoiceCommandHandler(IInvoiceRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<InvoiceDto> Handle(CreateInvoiceCommand request, CancellationToken ct)
    {
        var tenantId = _tenantContext.TenantId;
        var year = DateTime.UtcNow.Year;

        var sequence = await _repository.GetSequenceAsync(tenantId, year, ct);
        if (sequence == null)
        {
            sequence = new InvoiceSequence(tenantId, year);
            await _repository.AddSequenceAsync(sequence, ct);
        }

        var seqNumber = sequence.GetNextSequence();
        await _repository.UpdateSequenceAsync(sequence, ct);

        var invoiceNumber = $"INV-{year}-{seqNumber:D6}";
        var entityType = Enum.Parse<BilledToEntityType>(request.BilledToEntityType);

        var invoice = new Invoice(
            invoiceNumber,
            entityType,
            request.BilledToEntityId,
            request.BillToName,
            request.BillToAddress,
            request.BillToEmail,
            request.Currency,
            request.InvoiceDate,
            request.DueDate,
            "system");

        foreach (var item in request.LineItems)
        {
            var lineItem = new InvoiceLineItem(
                invoice.Id,
                item.Description,
                item.Quantity,
                item.UnitPrice,
                item.DiscountPercent,
                item.TaxRate,
                item.ReferenceType,
                item.ReferenceId,
                "system");
            invoice.AddLineItem(lineItem);
        }

        if (!request.SaveAsDraft)
        {
            invoice.Approve("system");
        }

        await _repository.AddAsync(invoice, ct);

        return MapToDto(invoice);
    }

    private static InvoiceDto MapToDto(Invoice invoice)
    {
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
