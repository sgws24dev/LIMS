using MediatR;

namespace ResearchLms.Billing.Application.Commands.Invoices;

public record VoidInvoiceCommand(Guid Id, string Reason) : IRequest;
