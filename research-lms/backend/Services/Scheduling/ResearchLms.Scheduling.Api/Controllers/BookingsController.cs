using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Scheduling.Application.Commands;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Application.Queries;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Api.Controllers;

[ApiController]
[Route("api/v1/scheduling/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetBookings(
        [FromQuery] Guid? userId,
        [FromQuery] Guid? resourceId,
        [FromQuery] ResourceType? resourceType,
        [FromQuery] BookingStatus? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetBookingsQuery(
            userId, resourceId, resourceType, status, from, to,
            search, page, pageSize);

        var (items, total) = await _mediator.Send(query);

        return Ok(new ApiResponse(true, items, null, total));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBookingById(Guid id)
    {
        var query = new GetBookingByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result is null)
            return NotFound(new ApiResponse(false, null, "Booking not found.", null));

        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userNameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        var command = new CreateBookingCommand(
            request.ResourceId,
            request.ResourceType,
            userId,
            userNameClaim ?? "Unknown",
            request.Title,
            request.StartTime,
            request.EndTime,
            request.Purpose,
            request.Notes);

        var bookingId = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetBookingById), new { id = bookingId },
            new ApiResponse(true, new { id = bookingId }, null, null));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateBooking(Guid id, [FromBody] UpdateBookingRequest request)
    {
        var command = new UpdateBookingCommand(
            id, request.Title, request.StartTime, request.EndTime,
            request.Purpose, request.Notes);

        await _mediator.Send(command);

        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelBooking(Guid id, [FromBody] CancelBookingRequest? request)
    {
        var command = new CancelBookingCommand(id, request?.Reason);
        await _mediator.Send(command);

        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpPost("{id:guid}/check-in")]
    [Authorize(Policy = "SchedulingAdmin")]
    public async Task<IActionResult> CheckIn(Guid id)
    {
        await _mediator.Send(new CheckInBookingCommand(id));
        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpGet("my-stats")]
    public async Task<IActionResult> GetMyStats()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        var result = await _mediator.Send(new GetMyBookingStatsQuery(userId));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpGet("cost-estimate")]
    public async Task<IActionResult> GetCostEstimate(
        [FromQuery] Guid resourceId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] bool isRecurring = false,
        [FromQuery] int? instanceCount = null)
    {
        var query = new GetBookingCostQuery(resourceId, from, to, isRecurring, instanceCount);
        var result = await _mediator.Send(query);
        return Ok(new ApiResponse(true, result, null, null));
    }
}
