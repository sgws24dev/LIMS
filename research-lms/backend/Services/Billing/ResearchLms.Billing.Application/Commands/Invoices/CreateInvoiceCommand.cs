using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Commands.Invoices;

public record CreateInvoiceCommand(
    string BilledToEntityType,
    Guid? BilledToEntityId,
    string BillToName,
    string BillToAddress,
    string BillToEmail,
    string Currency,
    DateTime InvoiceDate,
    DateTime DueDate,
    List<CreateInvoiceLineItemDto> LineItems,
    bool SaveAsDraft
) : IRequest<InvoiceDto>;

public record CreateInvoiceLineItemDto(
    string Description,
    decimal Quantity,
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal TaxRate,
    string? ReferenceType,
    Guid? ReferenceId
);
