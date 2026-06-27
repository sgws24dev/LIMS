using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Content.Application.Commands;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Application.Queries;

namespace ResearchLms.Content.Api.Controllers;

[ApiController]
[Route("api/v1/content/help-categories")]
[Authorize]
public class HelpCategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public HelpCategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<HelpCategoryDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetHelpCategoriesQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateHelpCategoryRequest request)
    {
        var id = await _mediator.Send(new CreateHelpCategoryCommand(
            request.Name, request.Slug, request.SortOrder, request.ParentCategoryId));
        return CreatedAtAction(nameof(GetAll), new { }, id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateHelpCategoryRequest request)
    {
        await _mediator.Send(new UpdateHelpCategoryCommand(
            id, request.Name, request.Slug, request.SortOrder, request.ParentCategoryId));
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteHelpCategoryCommand(id));
        return NoContent();
    }
}
