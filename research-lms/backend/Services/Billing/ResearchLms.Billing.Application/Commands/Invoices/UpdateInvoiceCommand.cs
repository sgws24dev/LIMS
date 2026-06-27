using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Commands.Invoices;

public record UpdateInvoiceCommand(
    Guid Id,
    string BillToName,
    string BillToAddress,
    string BillToEmail,
    DateTime InvoiceDate,
    DateTime DueDate,
    List<CreateInvoiceLineItemDto> LineItems
) : IRequest<InvoiceDto>;
