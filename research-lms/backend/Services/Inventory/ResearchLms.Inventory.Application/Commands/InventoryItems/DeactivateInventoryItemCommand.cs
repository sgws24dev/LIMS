using MediatR;

namespace ResearchLms.Inventory.Application.Commands.InventoryItems;

public record DeactivateInventoryItemCommand(Guid ItemId) : IRequest<Unit>;
