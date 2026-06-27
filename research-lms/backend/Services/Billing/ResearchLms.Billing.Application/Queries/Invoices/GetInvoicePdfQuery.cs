using MediatR;

namespace ResearchLms.Billing.Application.Queries.Invoices;

public record GetInvoicePdfQuery(Guid Id) : IRequest<byte[]>;
