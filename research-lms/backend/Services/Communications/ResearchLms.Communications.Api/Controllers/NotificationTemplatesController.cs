using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Communications.Application.Commands;
using ResearchLms.Communications.Application.DTOs;
using ResearchLms.Communications.Application.Queries;
using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Api.Controllers;

[ApiController]
[Route("api/v1/communications/notifications/templates")]
[Authorize]
public class NotificationTemplatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationTemplatesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetTemplates()
    {
        var result = await _mediator.Send(new GetTemplatesQuery());
        return Ok(ApiResponse<IReadOnlyList<NotificationTemplateDto>>.Ok(
            result.ToList(), result.Count));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTemplate(Guid id, [FromBody] UpdateTemplateRequest request)
    {
        var channel = Enum.Parse<NotificationChannel>(request.Channel, ignoreCase: true);

        var command = new UpdateTemplateCommand(
            id, request.Name, channel, request.Subject, request.Body, request.IsDefault);

        await _mediator.Send(command);
        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpPost("{id:guid}/test")]
    public async Task<IActionResult> SendTest(Guid id, [FromBody] SendTestTemplateRequest request)
    {
        await _mediator.Send(new SendTestNotificationCommand(
            id, request.Email, request.PhoneNumber, request.WebhookUrl));
        return Ok(ApiResponse<bool>.Ok(true));
    }
}
