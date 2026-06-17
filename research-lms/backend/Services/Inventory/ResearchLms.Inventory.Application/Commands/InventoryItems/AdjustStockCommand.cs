using MediatR;

namespace ResearchLms.Inventory.Application.Commands.InventoryItems;

public record AdjustStockCommand(
    Guid ItemId,
    decimal Delta,
    string Reason,
    Guid? TransactedById,
    string? TransactedByName
) : IRequest<Unit>;
