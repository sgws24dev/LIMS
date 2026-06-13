namespace ResearchLms.Identity.Api.Controllers;

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Identity.Application.Commands;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Queries;
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TenantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TenantsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetTenants()
    {
        var result = await _mediator.Send(new GetTenantsQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTenantById(Guid id)
    {
        var result = await _mediator.Send(new GetTenantByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTenant(CreateTenantDto dto)
    {
        var result = await _mediator.Send(new CreateTenantCommand(dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTenant(Guid id, CreateTenantDto dto)
    {
        var result = await _mediator.Send(new UpdateTenantCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTenant(Guid id)
    {
        var result = await _mediator.Send(new DeleteTenantCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}
