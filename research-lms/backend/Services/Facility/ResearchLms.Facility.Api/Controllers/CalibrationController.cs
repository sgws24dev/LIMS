using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Facilities.Application.Commands;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Queries;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Facilities.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/calibration")]
public class CalibrationController : ControllerBase
{
    private readonly IMediator _mediator;
    public CalibrationController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetAll(
        [FromQuery] Guid? instrumentId, [FromQuery] string? status,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetCalibrationRecordsQuery(instrumentId, status, page, pageSize));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(new { items = result.Value!.Items, totalCount = result.Value.TotalCount }, result.Value.TotalCount));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<CalibrationDueSummaryDto>>> GetSummary()
    {
        var result = await _mediator.Send(new GetCalibrationSummaryQuery());
        if (result.IsFailure) return BadRequest(ApiResponse<CalibrationDueSummaryDto>.Fail(result.Error!));
        return Ok(ApiResponse<CalibrationDueSummaryDto>.Ok(result.Value!));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CalibrationRecordDto>>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetCalibrationRecordByIdQuery(id));
        if (result.IsFailure) return NotFound(ApiResponse<CalibrationRecordDto>.Fail(result.Error!));
        return Ok(ApiResponse<CalibrationRecordDto>.Ok(result.Value!));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateCalibrationRecordRequest dto)
    {
        var result = await _mediator.Send(new CreateCalibrationRecordCommand(dto));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return CreatedAtAction(nameof(GetById), new { id = result.Value }, ApiResponse<object>.Ok(new { id = result.Value }));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(Guid id, [FromBody] UpdateCalibrationRecordRequest dto)
    {
        var result = await _mediator.Send(new UpdateCalibrationRecordCommand(id, dto));
        if (result.IsFailure) return NotFound(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(new { }));
    }
}
