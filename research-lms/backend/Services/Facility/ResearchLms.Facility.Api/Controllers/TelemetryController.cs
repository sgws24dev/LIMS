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
[Route("api/v1/telemetry")]
public class TelemetryController : ControllerBase
{
    private readonly IMediator _mediator;
    public TelemetryController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> Ingest([FromBody] IngestTelemetryRequest dto)
    {
        var result = await _mediator.Send(new IngestTelemetryCommand(dto));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return CreatedAtAction(nameof(GetLatest), new { instrumentId = dto.InstrumentId }, ApiResponse<object>.Ok(new { id = result.Value }));
    }

    [HttpPost("batch")]
    public async Task<ActionResult<ApiResponse<IngestBatchResult>>> IngestBatch([FromBody] IngestTelemetryBatchRequest dto)
    {
        var result = await _mediator.Send(new IngestTelemetryBatchCommand(dto));
        if (result.IsFailure) return BadRequest(ApiResponse<IngestBatchResult>.Fail(result.Error!));
        return Ok(ApiResponse<IngestBatchResult>.Ok(result.Value!));
    }

    [HttpGet("{instrumentId:guid}/latest")]
    public async Task<ActionResult<ApiResponse<object>>> GetLatest(
        Guid instrumentId, [FromQuery] int count = 100)
    {
        var result = await _mediator.Send(new GetLatestTelemetryQuery(instrumentId, count));
        if (result.IsFailure) return BadRequest(ApiResponse<object>.Fail(result.Error!));
        return Ok(ApiResponse<object>.Ok(new { items = result.Value }));
    }

    [HttpGet("{instrumentId:guid}/summary")]
    public async Task<ActionResult<ApiResponse<TelemetrySummaryDto>>> GetSummary(Guid instrumentId)
    {
        var result = await _mediator.Send(new GetTelemetrySummaryQuery(instrumentId));
        if (result.IsFailure) return BadRequest(ApiResponse<TelemetrySummaryDto>.Fail(result.Error!));
        return Ok(ApiResponse<TelemetrySummaryDto>.Ok(result.Value!));
    }
}
