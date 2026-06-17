using MassTransit;
using Microsoft.Extensions.Logging;
using ResearchLms.Inventory.Application.Common.Events;

namespace ResearchLms.Inventory.Infrastructure.Services;

public class LowStockAlertEventConsumer(
    ILogger<LowStockAlertEventConsumer> logger)
    : IConsumer<LowStockAlertEvent>
{
    public Task Consume(ConsumeContext<LowStockAlertEvent> context)
    {
        var msg = context.Message;
        logger.LogWarning(
            "LOW STOCK: {ItemName} (SKU: {SKU}) — OnHand: {Qty}, ReorderPoint: {Rp}",
            msg.ItemName, msg.SKU, msg.QuantityOnHand, msg.ReorderPoint);
        return Task.CompletedTask;
    }
}
