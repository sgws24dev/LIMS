using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Projects.Application.Commands.CostCenters;
using ResearchLms.Projects.Application.Queries.CostCenters;

namespace ResearchLms.Projects.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects/cost-centers")]
public class CostCentersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool activeOnly = true,
        [FromQuery] int? fiscalYear = null)
    {
        var query = new GetCostCentersQuery(activeOnly, fiscalYear);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetCostCenterSpendQuery(id);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}/spend")]
    public async Task<IActionResult> GetSpend(Guid id)
    {
        var query = new GetCostCenterSpendQuery(id);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "ProjectAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateCostCenterCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "ProjectAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCostCenterCommand cmd)
    {
        if (id != cmd.CostCenterId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        await mediator.Send(cmd);
        return NoContent();
    }
}
