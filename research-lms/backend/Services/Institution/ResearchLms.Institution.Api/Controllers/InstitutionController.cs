using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Institution.Application.Commands;
using ResearchLms.Institution.Application.DTOs;
using ResearchLms.Institution.Application.Queries;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Institution.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/institutions")]
public class InstitutionController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantContext _tenantContext;

    public InstitutionController(IMediator mediator, ITenantContext tenantContext)
    {
        _mediator = mediator;
        _tenantContext = tenantContext;
    }

    [HttpGet("settings")]
    public async Task<ActionResult<InstitutionSettingsDto>> GetSettings()
    {
        var result = await _mediator.Send(new GetInstitutionSettingsQuery(_tenantContext.TenantId));
        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("settings")]
    public async Task<ActionResult<InstitutionSettingsDto>> UpdateSettings([FromBody] UpdateInstitutionSettingsDto dto)
    {
        var result = await _mediator.Send(new UpdateInstitutionSettingsCommand(_tenantContext.TenantId, dto));
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
}
