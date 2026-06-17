using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Projects.Application.Commands.Issues;
using ResearchLms.Projects.Application.Queries.Issues;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/issues")]
public class IssuesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetIssuesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetIssueByIdQuery(id);
        var result = await mediator.Send(query);
        if (result is null) return NotFound(new { success = false, message = "Issue not found." });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateIssueCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateIssueCommand cmd)
    {
        if (id != cmd.IssueId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        await mediator.Send(cmd);
        return NoContent();
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateIssueStatusRequest req)
    {
        var cmd = new UpdateIssueStatusCommand(id, req.NewStatus, Guid.Empty);
        await mediator.Send(cmd);
        return NoContent();
    }

    [HttpPost("{id:guid}/sync")]
    public async Task<IActionResult> SyncToExternal(Guid id, [FromBody] SyncIssueRequest req)
    {
        var cmd = new SyncIssueToExternalCommand(id, req.Provider);
        var result = await mediator.Send(cmd);
        return Ok(result);
    }

    [HttpPost("sync-project")]
    [Authorize(Policy = "IssueAdmin")]
    public async Task<IActionResult> SyncProject([FromBody] SyncProjectIssuesCommand cmd)
    {
        var result = await mediator.Send(cmd);
        return Ok(result);
    }
}
