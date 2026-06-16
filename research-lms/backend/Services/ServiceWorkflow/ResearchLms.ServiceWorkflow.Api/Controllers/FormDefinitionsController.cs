using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.ServiceWorkflow.Application.Commands.FormDefinitions;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Application.Queries.FormDefinitions;

namespace ResearchLms.ServiceWorkflow.Api.Controllers;

[ApiController]
[Route("api/v1/service-workflow/form-definitions")]
[Authorize]
public class FormDefinitionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FormDefinitionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<FormDefinitionDto>>>> GetAll(
        [FromQuery] Guid tenantId,
        [FromQuery] bool? publishedOnly)
    {
        var query = new GetFormDefinitionsQuery(tenantId, publishedOnly);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<FormDefinitionDto>>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetFormDefinitionByIdQuery(id));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "FormAdmin")]
    public async Task<ActionResult<ApiResponse<FormDefinitionDto>>> Create(
        [FromBody] CreateFormDefinitionRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var command = new CreateFormDefinitionCommand(
            request.Title, request.Description, request.Schema, request.Category, userId);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "FormAdmin")]
    public async Task<ActionResult<ApiResponse<FormDefinitionDto>>> Update(
        Guid id, [FromBody] UpdateFormDefinitionRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var command = new UpdateFormDefinitionCommand(
            id, request.Title, request.Description, request.Schema, request.Category, userId);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "FormAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _mediator.Send(new DeleteFormDefinitionCommand(id, userId));
        return Ok(result);
    }

    [HttpPost("{id:guid}/publish")]
    [Authorize(Policy = "FormAdmin")]
    public async Task<ActionResult<ApiResponse<FormDefinitionDto>>> Publish(Guid id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _mediator.Send(new PublishFormDefinitionCommand(id, userId));
        return Ok(result);
    }
}
