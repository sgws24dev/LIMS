using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Content.Application.Commands;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Application.Queries;
using ResearchLms.Content.Domain.Enums;

namespace ResearchLms.Content.Api.Controllers;

[ApiController]
[Route("api/v1/content/publications")]
[Authorize]
public class PublicationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PublicationsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PublicationDto>>> Search(
        [FromQuery] string? searchTerm, [FromQuery] string? type,
        [FromQuery] string? author, [FromQuery] int? year, [FromQuery] string? journal)
    {
        var result = await _mediator.Send(new SearchPublicationsQuery(searchTerm, type, author, year, journal));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PublicationDto>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetPublicationByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("search-doi")]
    public async Task<ActionResult<CreatePublicationRequest?>> SearchByDoi([FromQuery] string doi)
    {
        var pub = await _mediator.Send(new SearchByDoiQuery(doi));
        if (pub == null) return NotFound(new { success = false, error = "DOI not found" });
        return Ok(new { success = true, data = pub });
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreatePublicationRequest request)
    {
        var type = Enum.Parse<PublicationType>(request.Type, ignoreCase: true);
        var id = await _mediator.Send(new CreatePublicationCommand(
            request.Title, request.Authors, request.Journal, request.Doi, request.PmId,
            request.PublicationDate, type, request.Link, request.Abstract,
            request.IsVerified, request.InstrumentIds));
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreatePublicationRequest request)
    {
        var type = Enum.Parse<PublicationType>(request.Type, ignoreCase: true);
        await _mediator.Send(new UpdatePublicationCommand(
            id, request.Title, request.Authors, request.Journal, request.Doi, request.PmId,
            request.PublicationDate, type, request.Link, request.Abstract,
            request.IsVerified, request.InstrumentIds));
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeletePublicationCommand(id));
        return NoContent();
    }
}
