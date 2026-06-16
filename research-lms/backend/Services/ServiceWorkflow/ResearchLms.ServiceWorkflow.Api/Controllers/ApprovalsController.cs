using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.ServiceWorkflow.Application.Commands.Approvals;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Application.Queries.Approvals;

namespace ResearchLms.ServiceWorkflow.Api.Controllers;

[ApiController]
[Route("api/v1/service-workflow/approvals")]
[Authorize]
public class ApprovalsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ApprovalsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("pending")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ApprovalDto>>>> GetPending()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var result = await _mediator.Send(new GetPendingApprovalsQuery(userId));
        return Ok(result);
    }

    [HttpGet("request/{requestId:guid}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ApprovalDto>>>> GetByRequest(Guid requestId)
    {
        var result = await _mediator.Send(new GetApprovalsByRequestQuery(requestId));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "RequestAdmin")]
    public async Task<ActionResult<ApiResponse<ApprovalDto>>> Create(
        [FromBody] CreateApprovalRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
        var command = new CreateApprovalCommand(
            request.ServiceRequestId, request.StepOrder, request.ApproverUserId,
            request.ApproverName, userId);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetByRequest), new { requestId = request.ServiceRequestId }, result);
    }

    [HttpPost("{id:guid}/decide")]
    public async Task<ActionResult<ApiResponse<ApprovalDto>>> Decide(
        Guid id, [FromBody] ApprovalDecisionRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var command = new DecideApprovalCommand(id, request.Approved, request.Comment, userId);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
