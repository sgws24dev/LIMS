using MediatR;

namespace ResearchLms.Inventory.Application.Commands.StockMovements;

public record WriteOffStockCommand(
    Guid ItemId,
    decimal Quantity,
    string Reason,
    Guid? TransactedById,
    string? TransactedByName
) : IRequest<Guid>;
