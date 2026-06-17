using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public class GetInventoryDashboardStatsQueryHandler : IRequestHandler<GetInventoryDashboardStatsQuery, InventoryDashboardStatsDto>
{
    private readonly IInventoryItemRepository _repository;

    public GetInventoryDashboardStatsQueryHandler(IInventoryItemRepository repository) => _repository = repository;

    public async Task<InventoryDashboardStatsDto> Handle(GetInventoryDashboardStatsQuery request, CancellationToken ct)
    {
        var stats = await _repository.GetDashboardStatsAsync(ct);
        return new InventoryDashboardStatsDto(
            stats.TotalItems, stats.LowStockCount, stats.OutOfStockCount,
            stats.ExpiringCount, 0, stats.TotalInventoryValue,
            stats.PendingPoCount, 0);
    }
}
