using MediatR;

namespace ResearchLms.Billing.Application.Commands.Invoices;

public record SendInvoiceCommand(Guid Id) : IRequest;
