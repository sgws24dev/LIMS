using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Facilities.Application.Queries;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Facilities.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/assets")]
public class DepreciationController : ControllerBase
{
    private readonly IMediator _mediator;
    public DepreciationController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{id:guid}/depreciation-schedule")]
    public async Task<ActionResult<ApiResponse<object>>> GetDepreciationSchedule(Guid id)
    {
        var result = await _mediator.Send(new GetDepreciationScheduleQuery(id));
        if (result.IsFailure) return NotFound(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(result.Value!));
    }

    [HttpPatch("{id:guid}/recalculate-depreciation")]
    public async Task<ActionResult<ApiResponse<object>>> RecalculateDepreciation(Guid id)
    {
        var result = await _mediator.Send(new GetDepreciationScheduleQuery(id));
        if (result.IsFailure) return NotFound(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(new { }));
    }
}
