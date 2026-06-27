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
[Route("api/v1/communications/announcements")]
[Authorize]
public class AnnouncementsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AnnouncementsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAnnouncements(
        [FromQuery] string? audience,
        [FromQuery] AnnouncementPriority? minPriority,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var query = new GetAnnouncementsQuery(audience, minPriority, from, to);
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<IReadOnlyList<AnnouncementDto>>.Ok(
            result.ToList(), result.Count));
    }

    [HttpPost]
    public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementRequest request)
    {
        var priority = Enum.Parse<AnnouncementPriority>(request.Priority, ignoreCase: true);

        var command = new CreateAnnouncementCommand(
            request.Title,
            request.Body,
            priority,
            request.TargetAudience,
            request.ValidFrom,
            request.ValidTo);

        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAnnouncements), new { id },
            ApiResponse<Guid>.Ok(id));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateAnnouncement(Guid id, [FromBody] CreateAnnouncementRequest request)
    {
        var priority = Enum.Parse<AnnouncementPriority>(request.Priority, ignoreCase: true);

        var command = new UpdateAnnouncementCommand(
            id, request.Title, request.Body, priority,
            request.TargetAudience, request.ValidFrom, request.ValidTo);

        await _mediator.Send(command);
        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAnnouncement(Guid id)
    {
        await _mediator.Send(new DeleteAnnouncementCommand(id));
        return Ok(ApiResponse<bool>.Ok(true));
    }
}
