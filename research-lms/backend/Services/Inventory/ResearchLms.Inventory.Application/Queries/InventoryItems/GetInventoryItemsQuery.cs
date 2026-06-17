using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public record GetInventoryItemsQuery(
    string? Search,
    ItemCategory? Category,
    bool? IsLowStock,
    bool? IsExpiringSoon,
    bool IncludeInactive,
    int Page,
    int PageSize
) : IRequest<PagedResult<InventoryItemDto>>;
