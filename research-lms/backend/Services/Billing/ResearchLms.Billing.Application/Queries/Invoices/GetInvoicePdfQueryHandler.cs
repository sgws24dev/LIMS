using MediatR;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Invoices;

public class GetInvoicePdfQueryHandler : IRequestHandler<GetInvoicePdfQuery, byte[]>
{
    private readonly IInvoicePdfService _pdfService;

    public GetInvoicePdfQueryHandler(IInvoicePdfService pdfService)
    {
        _pdfService = pdfService;
    }

    public async Task<byte[]> Handle(GetInvoicePdfQuery request, CancellationToken ct)
    {
        return await _pdfService.GeneratePdfAsync(request.Id, ct);
    }
}
