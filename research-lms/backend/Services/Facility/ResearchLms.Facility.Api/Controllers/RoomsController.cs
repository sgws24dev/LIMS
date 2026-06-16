using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Facilities.Application.Commands;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Queries;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Facilities.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/facilities/{facilityId:guid}/rooms")]
public class RoomsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantContext _tenantContext;

    public RoomsController(IMediator mediator, ITenantContext tenantContext)
    {
        _mediator = mediator;
        _tenantContext = tenantContext;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RoomDto>>> GetAll(Guid facilityId)
    {
        var result = await _mediator.Send(new GetRoomsByFacilityQuery(facilityId));
        if (result.IsFailure)
            return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<RoomDto>> Create(Guid facilityId, [FromBody] CreateRoomDto dto)
    {
        var result = await _mediator.Send(new CreateRoomCommand(facilityId, dto));
        if (result.IsFailure)
            return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetAll), new { facilityId }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RoomDto>> Update(Guid facilityId, Guid id, [FromBody] UpdateRoomDto dto)
    {
        var result = await _mediator.Send(new UpdateRoomCommand(id, dto));
        if (result.IsFailure)
            return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid facilityId, Guid id)
    {
        var result = await _mediator.Send(new DeleteRoomCommand(id));
        if (result.IsFailure)
            return NotFound(result.Error);
        return NoContent();
    }
}
