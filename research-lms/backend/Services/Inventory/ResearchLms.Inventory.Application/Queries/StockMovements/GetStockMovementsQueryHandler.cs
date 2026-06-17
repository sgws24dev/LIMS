using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.StockMovements;

public class GetStockMovementsQueryHandler : IRequestHandler<GetStockMovementsQuery, PagedResult<StockTransactionDto>>
{
    private readonly IStockTransactionRepository _repository;

    public GetStockMovementsQueryHandler(IStockTransactionRepository repository) => _repository = repository;

    public async Task<PagedResult<StockTransactionDto>> Handle(GetStockMovementsQuery request, CancellationToken ct)
    {
        var transactions = await _repository.GetByItemAsync(request.InventoryItemId ?? Guid.Empty);

        var filtered = transactions.AsEnumerable();
        if (request.TransactionType.HasValue)
            filtered = filtered.Where(t => t.Type == request.TransactionType.Value);

        var list = filtered.ToList();
        var items = list
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new StockTransactionDto(
                t.Id, t.Type.ToString(), t.Quantity, t.QuantityBefore,
                t.QuantityAfter, t.UnitCost, t.TotalCost,
                t.ReferenceType, t.ReferenceId, t.Notes,
                t.TransactedByName, t.TransactedAt))
            .ToList();

        return new PagedResult<StockTransactionDto>(
            items, list.Count, request.Page, request.PageSize);
    }
}
