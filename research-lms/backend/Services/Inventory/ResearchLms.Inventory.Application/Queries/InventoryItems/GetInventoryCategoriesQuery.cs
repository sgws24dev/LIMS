using MediatR;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public record GetInventoryCategoriesQuery : IRequest<IEnumerable<string>>;
