using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Compliance.Application.Commands;
using ResearchLms.Compliance.Application.DTOs;
using ResearchLms.Compliance.Application.Queries;

namespace ResearchLms.Compliance.Api.Controllers;

[ApiController]
[Route("api/v1/compliance/signatures")]
[Authorize]
public class SignaturesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SignaturesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<SignatureDto>> Capture([FromBody] CaptureSignatureCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetByEntity), new { entityType = command.SignedEntityType, entityId = command.SignedEntityId }, result);
    }

    [HttpGet("{id}/verify")]
    public async Task<ActionResult<bool>> Verify(Guid id, [FromQuery] string documentContext)
    {
        var result = await _mediator.Send(new VerifySignatureCommand(id, documentContext));
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SignatureDto>>> GetByEntity([FromQuery] string entityType, [FromQuery] Guid entityId)
    {
        var result = await _mediator.Send(new GetSignaturesForEntityQuery(entityType, entityId));
        return Ok(result);
    }
}
