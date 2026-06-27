using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Pricing;

public record GetReconciliationsQuery(string? Status = null) : IRequest<IReadOnlyList<ReconciliationDto>>;

public class GetReconciliationsQueryHandler : IRequestHandler<GetReconciliationsQuery, IReadOnlyList<ReconciliationDto>>
{
    private readonly IPaymentReconciliationRepository _repository;

    public GetReconciliationsQueryHandler(IPaymentReconciliationRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<ReconciliationDto>> Handle(GetReconciliationsQuery request, CancellationToken ct)
    {
        Domain.Enums.ReconciliationStatus? status = null;
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<Domain.Enums.ReconciliationStatus>(request.Status, true, out var parsed))
            status = parsed;

        var entities = await _repository.GetAllAsync(status, ct);
        return entities.Select(e => new ReconciliationDto
        {
            Id = e.Id,
            InvoiceId = e.InvoiceId,
            ReferenceNumber = e.ReferenceNumber,
            Amount = e.Amount,
            Currency = e.Currency,
            Status = e.Status.ToString(),
            TransactionDate = e.TransactionDate,
            MatchedAt = e.MatchedAt,
            Notes = e.Notes,
        }).ToList();
    }
}
