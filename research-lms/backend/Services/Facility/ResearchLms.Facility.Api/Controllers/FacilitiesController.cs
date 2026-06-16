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
[Route("api/v1/facilities")]
public class FacilitiesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantContext _tenantContext;

    public FacilitiesController(IMediator mediator, ITenantContext tenantContext)
    {
        _mediator = mediator;
        _tenantContext = tenantContext;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetAll([FromQuery] string? search, [FromQuery] string? type, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetAllFacilitiesQuery(search, type, page, pageSize));
        if (result.IsFailure)
            return BadRequest(result.Error);
        return Ok(new { items = result.Value!.Items, totalCount = result.Value.TotalCount });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FacilityDto>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetFacilityByIdQuery(id));
        if (result.IsFailure)
            return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<FacilityDto>> Create([FromBody] CreateFacilityDto dto)
    {
        var result = await _mediator.Send(new CreateFacilityCommand(dto));
        if (result.IsFailure)
            return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<FacilityDto>> Update(Guid id, [FromBody] UpdateFacilityDto dto)
    {
        var result = await _mediator.Send(new UpdateFacilityCommand(id, dto));
        if (result.IsFailure)
            return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteFacilityCommand(id));
        if (result.IsFailure)
            return NotFound(result.Error);
        return NoContent();
    }
}
