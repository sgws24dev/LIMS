using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Communications.Application.Commands;
using ResearchLms.Communications.Application.DTOs;
using ResearchLms.Communications.Application.Queries;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Api.Controllers;

[ApiController]
[Route("api/v1/communications/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool? unreadOnly,
        [FromQuery] string? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetNotificationsQuery(unreadOnly, type, page, pageSize);
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<IReadOnlyList<NotificationDto>>.Ok(
            result.ToList(), result.Count()));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _mediator.Send(new GetUnreadCountQuery());
        return Ok(ApiResponse<int>.Ok(count));
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _mediator.Send(new MarkNotificationReadCommand(id));
        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _mediator.Send(new MarkAllNotificationsReadCommand());
        return Ok(ApiResponse<bool>.Ok(true));
    }
}
