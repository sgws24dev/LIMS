using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Billing.Application.Commands.Dashboards;
using ResearchLms.Billing.Application.Commands.Widgets;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Application.Queries.Dashboards;

namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing/dashboards")]
[Authorize]
public class DashboardsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DashboardDefinitionDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetDashboardsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DashboardDefinitionDto>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetDashboardByIdQuery(id));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<DashboardDefinitionDto>> Create([FromBody] CreateDashboardCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DashboardDefinitionDto>> Update(Guid id, [FromBody] UpdateDashboardCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteDashboardCommand(id));
        return NoContent();
    }

    [HttpPost("{id}/clone")]
    public async Task<ActionResult<DashboardDefinitionDto>> Clone(Guid id, [FromBody] CloneDashboardCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{dashboardId}/widgets/{widgetId}/data")]
    public async Task<ActionResult<WidgetDataDto>> GetWidgetData(
        Guid dashboardId,
        Guid widgetId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        var result = await _mediator.Send(new GetWidgetDataQuery(dashboardId, widgetId, from, to));
        return Ok(result);
    }

    [HttpPut("{dashboardId}/widgets/{widgetId}")]
    public async Task<ActionResult<DashboardWidgetDto>> UpdateWidgetConfig(
        Guid dashboardId,
        Guid widgetId,
        [FromBody] UpdateWidgetConfigCommand command)
    {
        if (dashboardId != command.DashboardId || widgetId != command.WidgetId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
