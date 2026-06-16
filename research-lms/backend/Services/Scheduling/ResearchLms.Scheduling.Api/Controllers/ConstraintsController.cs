using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Scheduling.Application.Commands;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Application.Queries;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/scheduling/constraints")]
public class ConstraintsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ConstraintsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetConstraints(
        [FromQuery] Guid? resourceId,
        [FromQuery] ConstraintType? type)
    {
        var result = await _mediator.Send(new GetConstraintsQuery(resourceId, type));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpGet("evaluate")]
    public async Task<IActionResult> Evaluate(
        [FromQuery] Guid resourceId,
        [FromQuery] Guid userId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        var result = await _mediator.Send(
            new EvaluateConstraintsQuery(resourceId, userId, from, to));
        return Ok(new ApiResponse(true, result, null, null));
    }

    [HttpPost]
    [Authorize(Policy = "SchedulingAdmin")]
    public async Task<IActionResult> CreateConstraint([FromBody] CreateConstraintRequest request)
    {
        var command = new CreateConstraintCommand(
            request.ResourceId,
            request.ResourceType,
            request.Type,
            request.Value,
            request.Description,
            request.ErrorMessage);

        var id = await _mediator.Send(command);
        return Ok(new ApiResponse(true, new { id }, null, null));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "SchedulingAdmin")]
    public async Task<IActionResult> UpdateConstraint(Guid id, [FromBody] UpdateConstraintRequest request)
    {
        await _mediator.Send(new UpdateConstraintCommand(
            id, request.Value, request.Description, request.ErrorMessage, request.IsActive));
        return Ok(new ApiResponse(true, null, null, null));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "SchedulingAdmin")]
    public async Task<IActionResult> DeleteConstraint(Guid id)
    {
        await _mediator.Send(new DeleteConstraintCommand(id));
        return Ok(new ApiResponse(true, null, null, null));
    }
}
