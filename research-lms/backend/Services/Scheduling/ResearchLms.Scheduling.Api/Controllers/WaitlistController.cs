using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Scheduling.Application.Commands;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Application.Queries;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/scheduling/waitlist")]
public class WaitlistController : ControllerBase
{
    private readonly IMediator _mediator;

    public WaitlistController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetWaitlist(
        [FromQuery] Guid? resourceId,
        [FromQuery] WaitlistStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        Guid? userId = userIdClaim is not null && Guid.TryParse(userIdClaim, out var uid) ? uid : null;

        var isAdmin = User.IsInRole("System Administrator") || User.IsInRole("Institution Admin");

        var result = await _mediator.Send(
            new GetWaitlistQuery(isAdmin ? null : userId, resourceId, status, page, pageSize));
        return Ok(new ApiResponse(true, result.Items, null, result.TotalCount));
    }

    [HttpGet("{id:guid}/position")]
    public async Task<IActionResult> GetPosition(Guid id)
    {
        var position = await _mediator.Send(new GetWaitlistPositionQuery(id));
        return Ok(new ApiResponse(true, new { position }, null, null));
    }

    [HttpPost]
    public async Task<IActionResult> JoinWaitlist([FromBody] JoinWaitlistRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userNameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        var command = new JoinWaitlistCommand(
            request.ResourceId, request.ResourceType,
            request.RequestedDate, request.RequestedStartTime,
            request.RequestedEndTime, userId, userNameClaim ?? "Unknown",
            request.Notes);

        var id = await _mediator.Send(command);
        return Ok(new ApiResponse(true, new { id }, null, null));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> LeaveWaitlist(Guid id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        await _mediator.Send(new LeaveWaitlistCommand(id, userId));
        return Ok(new ApiResponse(true, null, null, null));
    }
}
