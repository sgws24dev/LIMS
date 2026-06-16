using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Application.Queries;

namespace ResearchLms.Scheduling.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/scheduling/conflicts")]
public class ConflictsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ConflictsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetResourceConflicts(
        [FromQuery] Guid? resourceId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        var result = await _mediator.Send(new GetConflictsQuery(resourceId, null, from, to));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserConflicts(
        [FromQuery] Guid userId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        var result = await _mediator.Send(new GetConflictsQuery(null, userId, from, to));
        return Ok(new ApiResponse(true, result, null, null));
    }
}
