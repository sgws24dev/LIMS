using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Scheduling.Application.Commands;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Application.Queries;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Api.Controllers;

[ApiController]
[Route("api/v1/scheduling/calendar-sync")]
[Authorize]
public class CalendarSyncController : ControllerBase
{
    private readonly IMediator _mediator;

    public CalendarSyncController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        var result = await _mediator.Send(new GetCalendarSyncStatusQuery(userId));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpGet("auth-url")]
    public async Task<IActionResult> GetAuthUrl(
        [FromQuery] SyncProvider provider,
        [FromQuery] string redirectUri)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        var url = await _mediator.Send(new GetCalendarAuthUrlQuery(provider, redirectUri, userId));
        return Ok(new ApiResponse(true, new { url }, null, null));
    }

    [HttpPost("callback")]
    public async Task<IActionResult> Callback([FromBody] CalendarCallbackRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        if (!Guid.TryParse(tenantIdClaim, out var tenantId))
            tenantId = Guid.Empty;

        var provider = request.RedirectUri.Contains("google", StringComparison.OrdinalIgnoreCase)
            ? SyncProvider.Google
            : SyncProvider.Outlook;

        var command = new ConnectCalendarCommand(provider, request.Code, request.RedirectUri, userId, tenantId);
        await _mediator.Send(command);

        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpDelete("disconnect")]
    public async Task<IActionResult> Disconnect([FromQuery] SyncProvider provider)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        await _mediator.Send(new DisconnectCalendarCommand(provider, userId));
        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpPost("sync")]
    public async Task<IActionResult> TriggerSync([FromQuery] SyncProvider provider)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        await _mediator.Send(new TriggerManualSyncCommand(provider, userId));
        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        var result = await _mediator.Send(new GetSyncLogsQuery(userId, page, pageSize));
        return Ok(new ApiResponse(true, result.Items, null, result.TotalCount));
    }
}
