using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Queries.Invoices;

public record GetInvoiceByIdQuery(Guid Id) : IRequest<InvoiceDto?>;
