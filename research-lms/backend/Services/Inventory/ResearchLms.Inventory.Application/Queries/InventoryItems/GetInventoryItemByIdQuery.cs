using MediatR;
using ResearchLms.Inventory.Application.DTOs;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public record GetInventoryItemByIdQuery(Guid ItemId) : IRequest<InventoryItemDetailDto?>;
