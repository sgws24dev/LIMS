using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Content.Application.Commands;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Application.Queries;
using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Api.Controllers;

[ApiController]
[Route("api/v1/content/help-articles")]
[Authorize]
public class HelpArticlesController : ControllerBase
{
    private readonly IMediator _mediator;

    public HelpArticlesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<HelpArticleDto>>> Search(
        [FromQuery] string? searchTerm,
        [FromQuery] Guid? categoryId,
        [FromQuery] string? tags,
        [FromQuery] bool? publishedOnly)
    {
        var tagList = !string.IsNullOrWhiteSpace(tags)
            ? tags.Split(',').Select(t => t.Trim()).ToList()
            : null;

        var result = await _mediator.Send(new SearchHelpArticlesQuery(
            searchTerm, categoryId, tagList, publishedOnly));
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<HelpArticleDto>> GetBySlug(string slug)
    {
        var result = await _mediator.Send(new GetHelpArticleBySlugQuery(slug));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateHelpArticleRequest request)
    {
        var id = await _mediator.Send(new CreateHelpArticleCommand(
            request.Title, request.Content, request.CategoryId, request.Tags, request.IsPublished));
        return CreatedAtAction(nameof(GetBySlug), new { slug = "" }, id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateHelpArticleRequest request)
    {
        await _mediator.Send(new UpdateHelpArticleCommand(
            id, request.Title, request.Content, request.CategoryId, request.Tags, request.IsPublished));
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteHelpArticleCommand(id));
        return NoContent();
    }
}
