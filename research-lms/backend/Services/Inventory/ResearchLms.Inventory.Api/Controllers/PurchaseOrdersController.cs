using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Inventory.Application.Commands.PurchaseOrders;
using ResearchLms.Inventory.Application.Queries.PurchaseOrders;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/inventory/purchase-orders")]
public class PurchaseOrdersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PurchaseOrderStatus? status,
        [FromQuery] Guid? vendorId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetPurchaseOrdersQuery(status, vendorId, fromDate, toDate, page, pageSize);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetPurchaseOrderByIdQuery(id);
        var result = await mediator.Send(query);
        if (result is null)
            return NotFound(new { success = false, message = "Purchase order not found." });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddLine(Guid id, [FromBody] AddPurchaseOrderLineCommand cmd)
    {
        if (id != cmd.PurchaseOrderId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        await mediator.Send(cmd);
        return NoContent();
    }

    [HttpDelete("{id:guid}/items/{lineId:guid}")]
    public async Task<IActionResult> RemoveLine(Guid id, Guid lineId)
    {
        await mediator.Send(new RemovePurchaseOrderLineCommand(id, lineId));
        return NoContent();
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await mediator.Send(new SubmitPurchaseOrderCommand(id));
        return Ok(new { message = "Purchase order submitted for approval." });
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = "PurchaseAdmin")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveRequest req)
    {
        await mediator.Send(new ApprovePurchaseOrderCommand(id, req.ApprovedById, req.ApprovedByName));
        return Ok(new { message = "Purchase order approved." });
    }

    [HttpPost("{id:guid}/send")]
    public async Task<IActionResult> Send(Guid id)
    {
        await mediator.Send(new SendPurchaseOrderCommand(id));
        return Ok(new { message = "Purchase order marked as sent to vendor." });
    }

    [HttpPost("{id:guid}/receive")]
    public async Task<IActionResult> Receive(Guid id, [FromBody] ReceivePurchaseOrderItemsCommand cmd)
    {
        if (id != cmd.PurchaseOrderId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        await mediator.Send(cmd);
        return Ok(new { message = "Receipt recorded." });
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdatePurchaseOrderStatusRequest req)
    {
        var cmd = new UpdatePurchaseOrderStatusCommand(id, req.NewStatus);
        await mediator.Send(cmd);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelRequest req)
    {
        await mediator.Send(new CancelPurchaseOrderCommand(id, req.Reason));
        return Ok(new { message = "Purchase order cancelled." });
    }
}

public record ApproveRequest(Guid ApprovedById, string ApprovedByName);
public record CancelRequest(string Reason);
public record UpdatePurchaseOrderStatusRequest(PurchaseOrderStatus NewStatus);
