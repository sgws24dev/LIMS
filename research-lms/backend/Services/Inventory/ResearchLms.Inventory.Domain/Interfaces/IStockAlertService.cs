using ResearchLms.Inventory.Domain.Entities;

namespace ResearchLms.Inventory.Domain.Interfaces;

public interface IStockAlertService
{
    Task<IReadOnlyList<InventoryItem>> GetLowStockItemsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<InventoryItem>> GetExpiringItemsAsync(int withinDays = 30, CancellationToken ct = default);
    Task CheckAndAlertAsync(CancellationToken ct = default);
}
