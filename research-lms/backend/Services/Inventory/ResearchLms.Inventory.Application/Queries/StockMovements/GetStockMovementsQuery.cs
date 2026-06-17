using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.StockMovements;

public record GetStockMovementsQuery(
    Guid? InventoryItemId,
    StockTransactionType? TransactionType,
    int Page,
    int PageSize
) : IRequest<PagedResult<StockTransactionDto>>;
