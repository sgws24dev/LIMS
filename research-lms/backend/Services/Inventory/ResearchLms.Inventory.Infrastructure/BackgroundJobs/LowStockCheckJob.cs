using MassTransit;
using Microsoft.Extensions.Logging;
using ResearchLms.Inventory.Application.Common.Events;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Infrastructure.BackgroundJobs;

public class LowStockCheckJob(
    IInventoryItemRepository itemRepo,
    IPublishEndpoint bus,
    ILogger<LowStockCheckJob> logger) : ILowStockCheckJob
{
    public async Task ExecuteAsync()
    {
        var lowStockItems = await itemRepo.GetLowStockItemsAsync(CancellationToken.None);

        foreach (var item in lowStockItems)
        {
            try
            {
                await bus.Publish(new LowStockAlertEvent(
                    item.Id,
                    Guid.Empty,
                    item.Name,
                    item.SKU,
                    item.QuantityOnHand,
                    item.ReorderPoint));

                logger.LogInformation(
                    "Low stock alert published for Item {SKU} (OnHand: {Qty}, ReorderPoint: {Rp})",
                    item.SKU, item.QuantityOnHand, item.ReorderPoint);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to publish low-stock alert for {ItemId}", item.Id);
            }
        }
    }
}
