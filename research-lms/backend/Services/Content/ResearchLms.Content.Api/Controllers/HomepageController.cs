using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Content.Application.Commands;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Application.Queries;

namespace ResearchLms.Content.Api.Controllers;

[ApiController]
[Route("api/v1/content/homepage")]
[Authorize]
public class HomepageController : ControllerBase
{
    private readonly IMediator _mediator;

    public HomepageController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<HomepageDto>> GetActive()
    {
        var result = await _mediator.Send(new GetActiveHomepageQuery());
        if (result == null) return Ok(new HomepageDto(Guid.Empty, "Default", false, "[]"));
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Save([FromBody] SaveHomepageRequest request)
    {
        await _mediator.Send(new SaveHomepageCommand(request.Name, request.IsActive, request.LayoutJson));
        return NoContent();
    }
}
