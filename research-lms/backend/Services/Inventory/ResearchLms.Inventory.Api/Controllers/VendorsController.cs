using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Inventory.Application.Commands.Vendors;
using ResearchLms.Inventory.Application.Queries.Vendors;

namespace ResearchLms.Inventory.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/inventory/vendors")]
public class VendorsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? nameFilter,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetVendorsQuery(nameFilter, null, page, pageSize);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetVendorByIdQuery(id);
        var result = await mediator.Send(query);
        if (result is null)
            return NotFound(new { success = false, message = "Vendor not found." });
        return Ok(result);
    }

    [HttpGet("{id:guid}/performance")]
    public async Task<IActionResult> GetPerformance(Guid id)
    {
        var query = new GetVendorPerformanceQuery(id);
        var result = await mediator.Send(query);
        if (result is null)
            return NotFound(new { success = false, message = "Vendor not found." });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVendorCommand cmd)
    {
        var id = await mediator.Send(cmd);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVendorCommand cmd)
    {
        if (id != cmd.VendorId)
            return BadRequest(new { success = false, message = "Route ID and body ID must match." });
        await mediator.Send(cmd);
        return NoContent();
    }
}
