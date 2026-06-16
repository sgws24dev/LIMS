using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Application.Queries.WorkflowDefinitions;

namespace ResearchLms.ServiceWorkflow.Api.Controllers;

[ApiController]
[Route("api/v1/service-workflow/workflow-definitions")]
[Authorize]
public class WorkflowDefinitionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkflowDefinitionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<WorkflowDefinitionDto>>>> GetAll()
    {
        var result = await _mediator.Send(new GetWorkflowDefinitionsQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<WorkflowDefinitionDto>>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetWorkflowDefinitionByIdQuery(id));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<WorkflowDefinitionDto>>> Create(
        [FromBody] CreateWorkflowDefinitionCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<WorkflowDefinitionDto>>> Update(
        Guid id, [FromBody] UpdateWorkflowDefinitionCommand command)
    {
        if (id != command.Id)
            return BadRequest(new ApiResponse<WorkflowDefinitionDto>(false, null, "Id mismatch."));

        var result = await _mediator.Send(command);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<ApiResponse<bool>>> Publish(Guid id, [FromBody] PublishRequest request)
    {
        var result = await _mediator.Send(new PublishWorkflowDefinitionCommand(id, request.UpdatedBy));
        return Ok(result);
    }

    [HttpPost("{id:guid}/unpublish")]
    public async Task<ActionResult<ApiResponse<bool>>> Unpublish(Guid id, [FromBody] PublishRequest request)
    {
        var result = await _mediator.Send(new UnpublishWorkflowDefinitionCommand(id, request.UpdatedBy));
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, [FromQuery] string deletedBy)
    {
        var result = await _mediator.Send(new DeleteWorkflowDefinitionCommand(id, deletedBy));
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpGet("{id:guid}/notification-rules")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationRuleDto>>>> GetNotificationRules(Guid id)
    {
        var result = await _mediator.Send(new GetNotificationRulesQuery(id));
        return Ok(result);
    }

    [HttpPost("{id:guid}/notification-rules")]
    public async Task<ActionResult<ApiResponse<NotificationRuleDto>>> AddNotificationRule(
        Guid id, [FromBody] AddNotificationRuleCommand command)
    {
        if (id != command.WorkflowDefinitionId)
            return BadRequest(new ApiResponse<NotificationRuleDto>(false, null, "Id mismatch."));

        var result = await _mediator.Send(command);
        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetNotificationRules), new { id }, result);
    }

    [HttpDelete("{definitionId:guid}/notification-rules/{ruleId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteNotificationRule(Guid definitionId, Guid ruleId)
    {
        var result = await _mediator.Send(new DeleteNotificationRuleCommand(ruleId));
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}

public record PublishRequest(string UpdatedBy);
