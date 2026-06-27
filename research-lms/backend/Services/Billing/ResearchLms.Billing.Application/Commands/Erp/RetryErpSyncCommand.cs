using MediatR;

namespace ResearchLms.Billing.Application.Commands.Erp;

public record RetryErpSyncCommand(Guid InvoiceId) : IRequest;
