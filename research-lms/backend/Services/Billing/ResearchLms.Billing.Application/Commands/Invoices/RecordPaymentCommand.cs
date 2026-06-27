using MediatR;

namespace ResearchLms.Billing.Application.Commands.Invoices;

public record RecordPaymentCommand(Guid Id, decimal Amount) : IRequest;
