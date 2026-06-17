using Microsoft.EntityFrameworkCore;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;
using ResearchLms.Inventory.Infrastructure.Persistence;

namespace ResearchLms.Inventory.Infrastructure.Repositories;

public class InventoryItemRepository : IInventoryItemRepository
{
    private readonly InventoryDbContext _context;

    public InventoryItemRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<InventoryItem?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.InventoryItems.Include(i => i.PreferredVendor)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task<InventoryItem?> GetBySkuAsync(string sku, CancellationToken ct = default)
        => await _context.InventoryItems.FirstOrDefaultAsync(i => i.SKU == sku, ct);

    public async Task<InventoryItem?> GetByBarcodeAsync(string barcode, CancellationToken ct = default)
        => await _context.InventoryItems.FirstOrDefaultAsync(i => i.Barcode == barcode, ct);

    public async Task<PagedResult<InventoryItem>> GetPagedAsync(
        string? search,
        string? category,
        bool? isLowStock,
        bool? isExpiringSoon,
        bool includeInactive,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = _context.InventoryItems.Include(i => i.PreferredVendor).AsQueryable();

        if (!includeInactive)
            query = query.Where(i => i.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(i =>
                i.Name.Contains(search) || i.SKU.Contains(search) || (i.Barcode != null && i.Barcode.Contains(search)));

        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<ItemCategory>(category, true, out var cat))
            query = query.Where(i => i.Category == cat);

        if (isLowStock.HasValue && isLowStock.Value)
            query = query.Where(i => i.QuantityOnHand <= i.ReorderPoint);

        if (isExpiringSoon.HasValue && isExpiringSoon.Value)
        {
            var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30));
            query = query.Where(i => i.ExpiryDate.HasValue && i.ExpiryDate.Value <= cutoff);
        }

        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(i => i.Name)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<InventoryItem>(items, total, page, pageSize);
    }

    public async Task<IEnumerable<InventoryItem>> GetLowStockItemsAsync(CancellationToken ct = default)
        => await _context.InventoryItems
            .Where(i => i.IsActive && i.ReorderPoint > 0 && i.QuantityOnHand <= i.ReorderPoint)
            .Include(i => i.PreferredVendor)
            .ToListAsync(ct);

    public async Task<IEnumerable<InventoryItem>> GetExpiringItemsAsync(int withinDays, CancellationToken ct = default)
    {
        var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(withinDays));
        return await _context.InventoryItems
            .Where(i => i.IsActive && i.ExpiryDate.HasValue && i.ExpiryDate.Value <= cutoff)
            .Include(i => i.PreferredVendor)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<InventoryItem>> GetExpiredItemsAsync(CancellationToken ct = default)
    {
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _context.InventoryItems
            .Where(i => i.IsActive && i.ExpiryDate.HasValue && i.ExpiryDate.Value < now)
            .Include(i => i.PreferredVendor)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<string>> GetCategoriesAsync(CancellationToken ct = default)
        => await _context.InventoryItems
            .Where(i => i.IsActive)
            .Select(i => i.Category.ToString())
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(ct);

    public async Task<InventoryDashboardStats> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var items = await _context.InventoryItems.Where(i => i.IsActive).ToListAsync(ct);
        var totalVendors = await _context.Vendors.CountAsync(ct);
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var cutoff = now.AddDays(30);

        return new InventoryDashboardStats(
            TotalItems: items.Count,
            LowStockCount: items.Count(i => i.IsLowStock),
            OutOfStockCount: items.Count(i => i.IsOutOfStock),
            ExpiringCount: items.Count(i => i.ExpiryDate.HasValue && i.ExpiryDate.Value <= cutoff),
            ExpiredCount: items.Count(i => i.ExpiryDate.HasValue && i.ExpiryDate.Value < now),
            TotalVendors: totalVendors,
            PendingPoCount: await _context.PurchaseOrders
                .Where(po => po.Status == PurchaseOrderStatus.PendingApproval || po.Status == PurchaseOrderStatus.Approved)
                .CountAsync(ct),
            TotalInventoryValue: items.Sum(i => i.QuantityOnHand * i.UnitCost),
            PendingPOValue: await _context.PurchaseOrders
                .Where(po => po.Status == PurchaseOrderStatus.PendingApproval || po.Status == PurchaseOrderStatus.Approved)
                .SumAsync(po => po.TotalAmount, ct)
        );
    }

    public async Task AddAsync(InventoryItem item, CancellationToken ct = default)
    {
        await _context.InventoryItems.AddAsync(item, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(InventoryItem item, CancellationToken ct = default)
    {
        _context.InventoryItems.Update(item);
        await _context.SaveChangesAsync(ct);
    }
}
