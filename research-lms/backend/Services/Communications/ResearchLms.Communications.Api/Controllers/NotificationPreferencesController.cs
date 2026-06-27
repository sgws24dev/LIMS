using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Communications.Application.Commands;
using ResearchLms.Communications.Application.DTOs;
using ResearchLms.Communications.Application.Queries;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Api.Controllers;

[ApiController]
[Route("api/v1/communications/notifications/preferences")]
[Authorize]
public class NotificationPreferencesController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationPreferencesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetPreferences()
    {
        var result = await _mediator.Send(new GetNotificationPreferencesQuery());
        return Ok(ApiResponse<IReadOnlyList<NotificationPreferenceDto>>.Ok(
            result.ToList(), result.Count));
    }

    [HttpPut]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdateNotificationPreferencesRequest request)
    {
        var command = new UpdateNotificationPreferencesCommand(
            request.NotificationType,
            request.Channels,
            request.IsOptedOut);

        await _mediator.Send(command);
        return Ok(ApiResponse<bool>.Ok(true));
    }
}
