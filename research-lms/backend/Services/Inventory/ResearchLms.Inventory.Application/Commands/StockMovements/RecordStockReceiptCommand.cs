using MediatR;

namespace ResearchLms.Inventory.Application.Commands.StockMovements;

public record RecordStockReceiptCommand(
    Guid ItemId,
    decimal Quantity,
    decimal UnitCost,
    Guid? ReferenceId,
    string? Notes,
    Guid? TransactedById,
    string? TransactedByName
) : IRequest<Guid>;
