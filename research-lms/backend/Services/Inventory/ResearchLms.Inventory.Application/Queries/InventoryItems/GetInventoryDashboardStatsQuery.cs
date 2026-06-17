using MediatR;
using ResearchLms.Inventory.Application.DTOs;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public record GetInventoryDashboardStatsQuery : IRequest<InventoryDashboardStatsDto>;
