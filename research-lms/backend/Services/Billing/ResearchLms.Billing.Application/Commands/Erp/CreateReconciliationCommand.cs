using MediatR;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.Erp;

public record CreateReconciliationCommand(Guid InvoiceId, string ReferenceNumber, decimal Amount, string Currency, DateTime TransactionDate) : IRequest;

public class CreateReconciliationCommandHandler : IRequestHandler<CreateReconciliationCommand>
{
    private readonly IPaymentReconciliationRepository _repository;

    public CreateReconciliationCommandHandler(IPaymentReconciliationRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(CreateReconciliationCommand request, CancellationToken ct)
    {
        var entity = new PaymentReconciliation(
            request.InvoiceId,
            request.ReferenceNumber,
            request.Amount,
            request.Currency,
            request.TransactionDate,
            "system");

        await _repository.AddAsync(entity, ct);
    }
}
