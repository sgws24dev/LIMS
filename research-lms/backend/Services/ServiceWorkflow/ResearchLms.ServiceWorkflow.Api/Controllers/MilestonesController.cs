using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.ServiceWorkflow.Application.Commands.Milestones;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Application.Queries.Milestones;

namespace ResearchLms.ServiceWorkflow.Api.Controllers;

[ApiController]
[Route("api/v1/service-workflow/requests/{requestId:guid}/milestones")]
[Authorize]
public class MilestonesController : ControllerBase
{
    private readonly IMediator _mediator;

    public MilestonesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<MilestoneDto>>>> GetByRequest(Guid requestId)
    {
        var result = await _mediator.Send(new GetMilestonesByRequestQuery(requestId));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "RequestAdmin")]
    public async Task<ActionResult<ApiResponse<MilestoneDto>>> Create(
        Guid requestId, [FromBody] CreateMilestoneRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var command = new CreateMilestoneCommand(
            requestId, request.Title, request.Description, request.Order, request.AssignedTo, userId);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetByRequest), new { requestId }, result);
    }

    [HttpPatch("{id:guid}")]
    [Authorize(Policy = "RequestAdmin")]
    public async Task<ActionResult<ApiResponse<MilestoneDto>>> UpdateStatus(
        Guid requestId, Guid id, [FromBody] string action)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _mediator.Send(new UpdateMilestoneStatusCommand(id, action, userId));
        return Ok(result);
    }
}
