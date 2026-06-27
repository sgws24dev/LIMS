using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Queries.Invoices;

public record GetInvoicesQuery(
    string? Status,
    DateTime? DateFrom,
    DateTime? DateTo,
    string? Search,
    int Page = 1,
    int PageSize = 20
) : IRequest<(IReadOnlyList<InvoiceDto> Items, int TotalCount)>;
