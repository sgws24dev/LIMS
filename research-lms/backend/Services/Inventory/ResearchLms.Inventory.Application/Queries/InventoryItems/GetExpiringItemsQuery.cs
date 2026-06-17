using MediatR;
using ResearchLms.Inventory.Application.DTOs;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public record GetExpiringItemsQuery(int DaysAhead = 30) : IRequest<IEnumerable<ExpiringItemDto>>;
