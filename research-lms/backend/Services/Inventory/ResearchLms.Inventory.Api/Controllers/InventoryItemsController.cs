using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Inventory.Application.Commands.InventoryItems;
using ResearchLms.Inventory.Application.Commands.StockMovements;
using ResearchLms.Inventory.Application.Queries.InventoryItems;
using ResearchLms.Inventory.Application.Queries.StockMovements;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/inventory/items")]
public class InventoryItemsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] ItemCategory? category,
        [FromQuery] bool? isLowStock,
        [FromQuery] bool? isExpiringSoon,
        [FromQuery] bool includeInactive = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetInventoryItemsQuery(search, category, isLowStock, isExpiringSoon, includeInactive, page, pageSize);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetInventoryItemByIdQuery(id);
        var result = await mediator.Send(query);
        if (result is null)
            return NotFound(new { success = false, message = "Item not found." });
        return Ok(result);
    }

    [HttpGet("by-barcode/{barcode}")]
    public async Task<IActionResult> GetByBarcode(string barcode)
    {
        var query = new GetInventoryItemsQuery(barcode, null, null, null, false, 1, 1);
        var result = await mediator.Send(query);
        var item = result.Items?.FirstOrDefault(i =>
            string.Equals(i.Barcode, barcode, StringComparison.OrdinalIgnoreCase));
        if (item is null)
            return NotFound(new { success = false, message = "No item found for this barcode." });
        return Ok(item);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var query = new GetInventoryDashboardStatsQuery();
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStockAlerts()
    {
        var query = new GetLowStockAlertsQuery();
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("expiring")]
    public async Task<IActionResult> GetExpiring([FromQuery] int daysAhead = 30)
    {
        var query = new GetExpiringItemsQuery(daysAhead);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var query = new GetInventoryCategoriesQuery();
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}/ledger")]
    public async Task<IActionResult> GetLedger(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var query = new GetStockMovementsQuery(id, null, page, pageSize);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}/movement-summary")]
    public async Task<IActionResult> GetMovementSummary(
        Guid id,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var movements = await mediator.Send(
            new GetStockMovementsQuery(id, null, 1, 1000));

        var fromDate = from ?? DateTime.UtcNow.AddMonths(-1);
        var toDate = to ?? DateTime.UtcNow;

        var filtered = movements.Items
            .Where(m => m.TransactedAt >= fromDate && m.TransactedAt <= toDate)
            .ToList();

        var totalIn = filtered.Where(m => m.Type == "Receipt").Sum(m => m.Quantity);
        var totalOut = filtered.Where(m => m.Type == "Issue").Sum(m => m.Quantity);
        var totalAdj = filtered.Where(m => m.Type == "Adjustment").Sum(m => m.Quantity);

        return Ok(new
        {
            TotalReceived = totalIn,
            TotalIssued = totalOut,
            TotalAdjusted = totalAdj,
            NetChange = totalIn + totalAdj - totalOut
        });
    }

    [HttpPost]
    [Authorize(Policy = "InventoryAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateInventoryItemCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "InventoryAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInventoryItemCommand cmd)
    {
        if (id != cmd.ItemId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        await mediator.Send(cmd);
        return NoContent();
    }

    [HttpPost("{id:guid}/stock")]
    [Authorize(Policy = "InventoryAdmin")]
    public async Task<IActionResult> AdjustStock(Guid id, [FromBody] AdjustStockCommand cmd)
    {
        if (id != cmd.ItemId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        await mediator.Send(cmd);
        return NoContent();
    }

    [HttpPost("{id:guid}/receipt")]
    public async Task<IActionResult> Receipt(Guid id, [FromBody] RecordStockReceiptCommand cmd)
    {
        if (id != cmd.ItemId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        var result = await mediator.Send(cmd);
        return Created($"/api/v1/inventory/items/{id}/ledger", new { id = result });
    }

    [HttpPost("{id:guid}/issue")]
    public async Task<IActionResult> Issue(Guid id, [FromBody] IssueStockCommand cmd)
    {
        if (id != cmd.ItemId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        var result = await mediator.Send(cmd);
        return Created($"/api/v1/inventory/items/{id}/ledger", new { id = result });
    }

    [HttpPost("{id:guid}/write-off")]
    [Authorize(Policy = "InventoryAdmin")]
    public async Task<IActionResult> WriteOff(Guid id, [FromBody] WriteOffStockCommand cmd)
    {
        if (id != cmd.ItemId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        var result = await mediator.Send(cmd);
        return Ok(new { id = result });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "InventoryAdmin")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        await mediator.Send(new DeactivateInventoryItemCommand(id));
        return NoContent();
    }

    private static string? GetCurrentUserId() => null;
    private static string? GetCurrentUserName() => null;
}
