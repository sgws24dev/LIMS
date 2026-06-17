using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Interfaces;
using ResearchLms.Inventory.Infrastructure.Persistence;

namespace ResearchLms.Inventory.Infrastructure.Services;

public class StockAlertService : IStockAlertService
{
    private readonly InventoryDbContext _context;
    private readonly ILogger<StockAlertService> _logger;

    public StockAlertService(InventoryDbContext context, ILogger<StockAlertService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IReadOnlyList<InventoryItem>> GetLowStockItemsAsync(CancellationToken ct = default)
    {
        return await _context.InventoryItems
            .Where(i => i.IsActive && i.ReorderPoint > 0 && i.QuantityOnHand <= i.ReorderPoint)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<InventoryItem>> GetExpiringItemsAsync(int withinDays = 30, CancellationToken ct = default)
    {
        var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(withinDays));
        return await _context.InventoryItems
            .Where(i => i.IsActive && i.ExpiryDate.HasValue && i.ExpiryDate <= cutoff)
            .ToListAsync(ct);
    }

    public async Task CheckAndAlertAsync(CancellationToken ct = default)
    {
        var lowStock = await GetLowStockItemsAsync(ct);
        foreach (var item in lowStock)
        {
            _logger.LogWarning(
                "Low stock alert: {Name} ({SKU}) - On hand: {Qty}, Reorder point: {Reorder}",
                item.Name, item.SKU, item.QuantityOnHand, item.ReorderPoint);
        }

        var expiring = await GetExpiringItemsAsync(30, ct);
        foreach (var item in expiring)
        {
            _logger.LogWarning(
                "Expiring item alert: {Name} ({SKU}) - Expires: {Expiry}",
                item.Name, item.SKU, item.ExpiryDate);
        }
    }
}
