using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Domain.Interfaces;

public interface IInventoryItemRepository
{
    Task<InventoryItem?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<InventoryItem?> GetBySkuAsync(string sku, CancellationToken ct = default);
    Task<InventoryItem?> GetByBarcodeAsync(string barcode, CancellationToken ct = default);
    Task<PagedResult<InventoryItem>> GetPagedAsync(
        string? search,
        string? category,
        bool? isLowStock,
        bool? isExpiringSoon,
        bool includeInactive,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task<IEnumerable<InventoryItem>> GetLowStockItemsAsync(CancellationToken ct = default);
    Task<IEnumerable<InventoryItem>> GetExpiringItemsAsync(int withinDays, CancellationToken ct = default);
    Task<IEnumerable<InventoryItem>> GetExpiredItemsAsync(CancellationToken ct = default);
    Task<IEnumerable<string>> GetCategoriesAsync(CancellationToken ct = default);
    Task<InventoryDashboardStats> GetDashboardStatsAsync(CancellationToken ct = default);
    Task AddAsync(InventoryItem item, CancellationToken ct = default);
    Task UpdateAsync(InventoryItem item, CancellationToken ct = default);
}

public record PagedResult<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize
);

public record InventoryDashboardStats(
    int TotalItems,
    int LowStockCount,
    int OutOfStockCount,
    int ExpiringCount,
    int ExpiredCount,
    int TotalVendors,
    int PendingPoCount,
    decimal TotalInventoryValue,
    decimal PendingPOValue
);
