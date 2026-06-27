using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Content.Application.Commands;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Application.Queries;
using ResearchLms.Content.Domain.Enums;

namespace ResearchLms.Content.Api.Controllers;

[ApiController]
[Route("api/v1/content/walkthroughs")]
[Authorize]
public class WalkthroughsController : ControllerBase
{
    private readonly IMediator _mediator;

    public WalkthroughsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("active")]
    public async Task<ActionResult<List<WalkthroughDto>>> GetActive([FromQuery] string route)
    {
        var result = await _mediator.Send(new GetActiveWalkthroughsQuery(route));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateWalkthroughRequest request)
    {
        var trigger = Enum.Parse<WalkthroughTrigger>(request.Trigger, ignoreCase: true);

        var steps = request.Steps.Select(s => new WalkthroughStepInput(
            s.StepOrder, s.Title, s.Content, s.ElementSelector,
            Enum.Parse<WalkthroughPlacement>(s.Placement, ignoreCase: true),
            Enum.Parse<WalkthroughActionType>(s.ActionType, ignoreCase: true)
        )).ToList();

        var id = await _mediator.Send(new CreateWalkthroughCommand(
            request.Name, request.TargetRoute, trigger, request.Priority, request.IsActive, steps));
        return CreatedAtAction(nameof(GetActive), new { route = request.TargetRoute }, id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateWalkthroughRequest request)
    {
        var trigger = Enum.Parse<WalkthroughTrigger>(request.Trigger, ignoreCase: true);
        await _mediator.Send(new UpdateWalkthroughCommand(
            id, request.Name, request.TargetRoute, trigger, request.Priority, request.IsActive));
        return NoContent();
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        await _mediator.Send(new CompleteWalkthroughCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/skip")]
    public async Task<IActionResult> Skip(Guid id)
    {
        await _mediator.Send(new SkipWalkthroughCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/progress")]
    public async Task<IActionResult> SaveProgress(Guid id, [FromBody] SaveWalkthroughProgressRequest request)
    {
        await _mediator.Send(new SaveWalkthroughProgressCommand(id, request.CurrentStepIndex));
        return NoContent();
    }

    [HttpGet("{id:guid}/progress")]
    public async Task<ActionResult<WalkthroughProgressDto?>> GetProgress(Guid id)
    {
        var result = await _mediator.Send(new GetWalkthroughProgressQuery(id));
        return Ok(result);
    }
}
