using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.ServiceWorkflow.Application.Commands.ServiceRequests;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Application.Queries.ServiceRequests;

namespace ResearchLms.ServiceWorkflow.Api.Controllers;

[ApiController]
[Route("api/v1/service-workflow/requests")]
[Authorize]
public class ServiceRequestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ServiceRequestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ServiceRequestDto>>>> GetAll(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? formDefinitionId,
        [FromQuery] string? status,
        [FromQuery] string? assignedTo,
        [FromQuery] string? createdBy)
    {
        var query = new GetServiceRequestsQuery(tenantId, formDefinitionId, status, assignedTo, createdBy);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ServiceRequestDto>>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetServiceRequestByIdQuery(id));
        return Ok(result);
    }

    [HttpGet("{id:guid}/history")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<RequestStatusHistoryDto>>>> GetHistory(Guid id)
    {
        var result = await _mediator.Send(new GetRequestStatusHistoryQuery(id));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "RequestAdmin")]
    public async Task<ActionResult<ApiResponse<ServiceRequestDto>>> Create(
        [FromBody] CreateServiceRequestRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var command = new CreateServiceRequestCommand(
            request.FormDefinitionId, request.Title, request.Description,
            request.FormData, request.ApprovalRouting, request.Priority, request.DueDate, userId);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<ApiResponse<ServiceRequestDto>>> Submit(
        Guid id, [FromBody] SubmitServiceRequestRequest? request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _mediator.Send(new SubmitServiceRequestCommand(id, userId, request?.Comment));
        return Ok(result);
    }

    [HttpPost("{id:guid}/assign")]
    [Authorize(Policy = "RequestAdmin")]
    public async Task<ActionResult<ApiResponse<ServiceRequestDto>>> Assign(
        Guid id, [FromBody] AssignServiceRequestRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _mediator.Send(new AssignServiceRequestCommand(id, request.AssignedTo, userId));
        return Ok(result);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<ApiResponse<ServiceRequestDto>>> Cancel(
        Guid id, [FromBody] string? comment)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _mediator.Send(new CancelServiceRequestCommand(id, userId, comment));
        return Ok(result);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "RequestAdmin")]
    public async Task<ActionResult<ApiResponse<ServiceRequestDto>>> ChangeStatus(
        Guid id, [FromBody] ChangeServiceRequestStatusCommand command)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _mediator.Send(new ChangeServiceRequestStatusCommand(
            id, command.NewStatus, userId, command.Comment));
        return Ok(result);
    }
}
