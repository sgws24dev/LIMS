using MediatR;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Application.Commands.StockMovements;

public record RecordStockMovementCommand(
    Guid InventoryItemId,
    StockTransactionType TransactionType,
    decimal Quantity,
    decimal UnitCost,
    string? ReferenceType,
    Guid? ReferenceId,
    string? Notes,
    Guid? TransactedById,
    string? TransactedByName
) : IRequest<Unit>;
