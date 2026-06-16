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
[Route("api/v1/scheduling/recurring-rules")]
public class RecurringRulesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RecurringRulesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetRules(
        [FromQuery] Guid? userId,
        [FromQuery] Guid? resourceId,
        [FromQuery] RecurringRuleStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(
            new GetRecurringRulesQuery(userId, resourceId, status, page, pageSize));
        return Ok(new ApiResponse(true, result.Items, null, result.TotalCount));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRuleById(Guid id)
    {
        var result = await _mediator.Send(new GetRecurringRuleByIdQuery(id));
        if (result is null)
            return NotFound(new ApiResponse(false, null, "Recurring rule not found.", null));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpPost]
    public async Task<IActionResult> CreateRule([FromBody] CreateRecurringRuleRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userNameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiResponse(false, null, "Invalid user token.", null));

        var command = new CreateRecurringRuleCommand(
            request.ResourceId, request.ResourceType,
            userId, userNameClaim ?? "Unknown",
            request.Title, request.Purpose, request.Notes,
            request.Frequency, request.DayOfWeekMask,
            request.TimeOfDay, request.DurationMinutes,
            request.EffectiveFrom, request.EffectiveTo,
            request.MaxInstances);

        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetRuleById), new { id },
            new ApiResponse(true, new { id }, null, null));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRule(Guid id, [FromBody] UpdateRecurringRuleRequest request)
    {
        var command = new UpdateRecurringRuleCommand(
            id, request.Title, request.Purpose,
            request.DayOfWeekMask, request.TimeOfDay,
            request.DurationMinutes, request.EffectiveTo,
            request.MaxInstances, request.Status);

        await _mediator.Send(command);
        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRule(Guid id)
    {
        await _mediator.Send(new DeleteRecurringRuleCommand(id));
        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpGet("{id:guid}/preview")]
    public async Task<IActionResult> PreviewRule(Guid id, [FromQuery] int count = 10)
    {
        var result = await _mediator.Send(
            new GetRecurringPreviewQuery(id, null, null, null, null, null, null, count));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpPost("preview")]
    public async Task<IActionResult> PreviewBeforeSave([FromBody] PreviewRecurringRequest request)
    {
        var result = await _mediator.Send(
            new GetRecurringPreviewQuery(
                null, request.Frequency, request.DayOfWeekMask,
                request.TimeOfDay, request.DurationMinutes,
                request.EffectiveFrom, request.EffectiveTo,
                request.PreviewCount ?? 10));
        return Ok(new ApiResponse(true, result, null, null));
    }
}
