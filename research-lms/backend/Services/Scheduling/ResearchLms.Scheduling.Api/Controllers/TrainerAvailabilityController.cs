using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Scheduling.Application.Commands;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Application.Queries;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Api.Controllers;

[ApiController]
[Route("api/v1/scheduling/trainer-availability")]
[Authorize]
public class TrainerAvailabilityController : ControllerBase
{
    private readonly IMediator _mediator;

    public TrainerAvailabilityController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAvailability([FromQuery] DateOnly? weekStartDate)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        var result = await _mediator.Send(new GetTrainerAvailabilityQuery(userId, weekStartDate));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpPost]
    public async Task<IActionResult> AddAvailability([FromBody] AddTrainerAvailabilityRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userNameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        var command = new AddTrainerAvailabilityCommand(
            userId,
            userNameClaim ?? "Unknown",
            request.DayOfWeek,
            request.StartTime,
            request.EndTime,
            request.IsAvailable,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.Notes);

        var id = await _mediator.Send(command);
        return Ok(new ApiResponse(true, new { id }, null, null));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateAvailability(
        Guid id,
        [FromBody] UpdateTrainerAvailabilityRequest request)
    {
        var command = new UpdateTrainerAvailabilityCommand(
            id, request.StartTime, request.EndTime, request.IsAvailable,
            request.EffectiveTo, request.Notes);

        await _mediator.Send(command);
        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAvailability(Guid id)
    {
        await _mediator.Send(new DeleteTrainerAvailabilityCommand(id));
        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpPost("{userId:guid}/sync")]
    [Authorize(Policy = "SchedulingAdmin")]
    public async Task<IActionResult> SyncCalendar(Guid userId, [FromQuery] SyncProvider provider)
    {
        await _mediator.Send(new SyncTrainerCalendarCommand(userId, provider));
        return Ok(new ApiResponse(true, null, null, null));
    }
}
