using MediatR;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Commands.Invoices;

public class VoidInvoiceCommandHandler : IRequestHandler<VoidInvoiceCommand>
{
    private readonly IInvoiceRepository _repository;
    private readonly ITenantContext _tenantContext;

    public VoidInvoiceCommandHandler(IInvoiceRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task Handle(VoidInvoiceCommand request, CancellationToken ct)
    {
        var invoice = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Invoice {request.Id} not found.");

        invoice.Void(request.Reason, "system");
        await _repository.UpdateAsync(invoice, ct);
    }
}
