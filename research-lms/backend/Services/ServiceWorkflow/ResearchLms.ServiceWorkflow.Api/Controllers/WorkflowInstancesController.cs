using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.ServiceWorkflow.Application.Commands.WorkflowInstances;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Application.Queries.WorkflowInstances;

namespace ResearchLms.ServiceWorkflow.Api.Controllers;

[ApiController]
[Route("api/v1/service-workflow/workflow-instances")]
[Authorize]
public class WorkflowInstancesController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkflowInstancesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("by-entity")]
    public async Task<ActionResult<ApiResponse<WorkflowInstanceDto>>> GetByEntity(
        [FromQuery] string entityType, [FromQuery] Guid entityId)
    {
        var result = await _mediator.Send(new GetWorkflowInstanceByEntityQuery(entityType, entityId));
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpGet("{instanceId:guid}/triggers")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AvailableTriggerDto>>>> GetAvailableTriggers(Guid instanceId)
    {
        var result = await _mediator.Send(new GetAvailableTriggersQuery(instanceId));
        return Ok(result);
    }

    [HttpPost("{instanceId:guid}/transition")]
    public async Task<ActionResult<ApiResponse<TransitionResultDto>>> ExecuteTransition(
        Guid instanceId, [FromBody] ExecuteTransitionRequest request)
    {
        var command = new ExecuteTransitionCommand(
            instanceId,
            request.Trigger,
            request.TriggeredBy,
            request.Comment,
            request.AdditionalContext);

        var result = await _mediator.Send(command);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}

public record ExecuteTransitionRequest(
    string Trigger,
    string? TriggeredBy,
    string? Comment,
    Dictionary<string, object>? AdditionalContext);
