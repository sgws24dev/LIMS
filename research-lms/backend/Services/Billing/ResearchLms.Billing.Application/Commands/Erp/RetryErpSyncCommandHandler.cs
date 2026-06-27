using MediatR;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.Erp;

public class RetryErpSyncCommandHandler : IRequestHandler<RetryErpSyncCommand>
{
    private readonly IInvoiceRepository _repository;
    private readonly IErpIntegrationService _erpService;

    public RetryErpSyncCommandHandler(IInvoiceRepository repository, IErpIntegrationService erpService)
    {
        _repository = repository;
        _erpService = erpService;
    }

    public async Task Handle(RetryErpSyncCommand request, CancellationToken ct)
    {
        var invoice = await _repository.GetByIdAsync(request.InvoiceId, ct)
            ?? throw new KeyNotFoundException($"Invoice {request.InvoiceId} not found.");

        var result = await _erpService.SendInvoiceAsync(invoice, ct);
        if (result.Success)
        {
            invoice.SetErpSyncStatus(ErpSyncStatus.Acknowledged, "system");
        }
        else
        {
            invoice.SetErpSyncStatus(ErpSyncStatus.Failed, "system");
        }

        await _repository.UpdateAsync(invoice, ct);
    }
}
