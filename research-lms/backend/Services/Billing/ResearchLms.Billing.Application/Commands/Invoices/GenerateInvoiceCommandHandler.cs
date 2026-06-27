using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Commands.Invoices;

public class GenerateInvoiceCommandHandler : IRequestHandler<GenerateInvoiceCommand, InvoiceDto>
{
    private readonly IInvoiceGenerationService _generationService;
    private readonly ITenantContext _tenantContext;

    public GenerateInvoiceCommandHandler(IInvoiceGenerationService generationService, ITenantContext tenantContext)
    {
        _generationService = generationService;
        _tenantContext = tenantContext;
    }

    public async Task<InvoiceDto> Handle(GenerateInvoiceCommand request, CancellationToken ct)
    {
        var createdBy = "system";
        var invoice = request.SourceType.ToLowerInvariant() switch
        {
            "servicerequest" => request.PreviewOnly
                ? await _generationService.PreviewFromServiceRequestAsync(request.SourceId, request.PricingModelId, request.CustomerType ?? "ExternalAcademic", createdBy, ct)
                : await _generationService.GenerateFromServiceRequestAsync(request.SourceId, request.PricingModelId, request.CustomerType ?? "ExternalAcademic", createdBy, ct),
            "booking" => request.PreviewOnly
                ? await _generationService.PreviewFromBookingAsync(request.SourceId, request.PricingModelId, request.CustomerType ?? "ExternalAcademic", createdBy, ct)
                : await _generationService.GenerateFromBookingAsync(request.SourceId, request.PricingModelId, request.CustomerType ?? "ExternalAcademic", createdBy, ct),
            _ => throw new ArgumentException($"Unsupported source type: {request.SourceType}")
        };

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
