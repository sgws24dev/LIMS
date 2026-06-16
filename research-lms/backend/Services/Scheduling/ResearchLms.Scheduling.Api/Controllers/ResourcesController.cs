using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Application.Queries;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Api.Controllers;

[ApiController]
[Route("api/v1/scheduling/resources")]
[Authorize]
public class ResourcesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ResourcesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetResources(
        [FromQuery] string? query,
        [FromQuery] ResourceType? type,
        [FromQuery] Guid? tenantId)
    {
        var result = await _mediator.Send(new GetResourcesQuery(query, type, tenantId));
        return Ok(new ApiResponse(true, result, null, null));
    }
}
