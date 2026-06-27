using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.AiServices.Application.Commands.TalkToAction;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Application.Queries.TalkToAction;

namespace ResearchLms.AiServices.Api.Controllers;

[ApiController]
[Route("api/v1/ai/talk-to-action")]
[Authorize]
public class TalkToActionController : ControllerBase
{
    private readonly IMediator _mediator;

    public TalkToActionController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("dry-run")]
    public async Task<ActionResult<ActionPlanDto>> DryRun([FromBody] DryRunRequest request)
    {
        var result = await _mediator.Send(new DryRunActionCommand(request.Utterance));
        return Ok(result);
    }

    [HttpPost("execute")]
    public async Task<ActionResult<ActionPlanDto>> Execute([FromBody] ExecuteActionRequest request)
    {
        var result = await _mediator.Send(new ExecuteActionCommand(request.Utterance));
        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<ActionLogEntryDto>>> GetHistory()
    {
        var result = await _mediator.Send(new GetActionHistoryQuery());
        return Ok(result);
    }
}
