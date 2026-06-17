using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Projects.Application.Commands.WorkOrders;
using ResearchLms.Projects.Application.Queries.WorkOrders;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects")]
public class WorkOrdersController(IMediator mediator) : ControllerBase
{
    [HttpGet("{projectId:guid}/work-orders")]
    public async Task<IActionResult> GetByProject(
        Guid projectId,
        [FromQuery] WorkOrderStatus? status,
        [FromQuery] Guid? assignedToId)
    {
        var query = new GetWorkOrdersQuery(projectId, status, assignedToId, null, 1, 1000);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("work-orders")]
    public async Task<IActionResult> GetAll([FromQuery] GetWorkOrdersQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("work-orders/{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetWorkOrderByIdQuery(id);
        var result = await mediator.Send(query);
        if (result is null) return NotFound(new { success = false, message = "Work order not found." });
        return Ok(result);
    }

    [HttpPost("work-orders")]
    public async Task<IActionResult> Create([FromBody] CreateWorkOrderCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("work-orders/{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWorkOrderCommand cmd)
    {
        if (id != cmd.WorkOrderId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        await mediator.Send(cmd);
        return NoContent();
    }

    [HttpPut("work-orders/{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateWorkOrderStatusRequest req)
    {
        var cmd = new UpdateWorkOrderStatusCommand(id, req.NewStatus, Guid.Empty);
        await mediator.Send(cmd);
        return NoContent();
    }
}
