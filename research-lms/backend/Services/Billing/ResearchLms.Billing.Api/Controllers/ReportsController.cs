using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Billing.Application.Commands.Reports;
using ResearchLms.Billing.Application.Commands.ReportSchedules;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Application.Queries.Reports;
using ResearchLms.Billing.Domain.Enums;


namespace ResearchLms.Billing.Api.Controllers;

[ApiController]
[Route("api/v1/billing")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<FinancialDashboardDto>> GetDashboard()
    {
        var result = await _mediator.Send(new GetFinancialDashboardQuery());
        return Ok(result);
    }

    [HttpGet("reports/asset-depreciation")]
    public async Task<ActionResult<AssetDepreciationReportDto>> GetDepreciationReport(
        [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo,
        [FromQuery] string? assetCategory, [FromQuery] string? depreciationMethod)
    {
        var result = await _mediator.Send(new GetAssetDepreciationReportQuery(dateFrom, dateTo, assetCategory, depreciationMethod));
        return Ok(result);
    }

    [HttpGet("reports/asset-valuation")]
    public async Task<ActionResult<AssetValuationReportDto>> GetAssetValuation()
    {
        var result = await _mediator.Send(new GetAssetValuationReportQuery());
        return Ok(result);
    }

    [HttpGet("report-definitions")]
    public async Task<ActionResult<List<ReportDefinitionDto>>> GetReportDefinitions()
    {
        var result = await _mediator.Send(new GetReportDefinitionsQuery());
        return Ok(result);
    }

    [HttpGet("report-definitions/{id}")]
    public async Task<ActionResult<ReportDefinitionDto>> GetReportDefinitionById(Guid id)
    {
        var result = await _mediator.Send(new GetReportDefinitionByIdQuery(id));
        return Ok(result);
    }

    [HttpPost("report-definitions")]
    public async Task<ActionResult<ReportDefinitionDto>> CreateReportDefinition([FromBody] CreateReportDefinitionCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetReportDefinitionById), new { id = result.Id }, result);
    }

    [HttpPut("report-definitions/{id}")]
    public async Task<ActionResult<ReportDefinitionDto>> UpdateReportDefinition(Guid id, [FromBody] UpdateReportDefinitionCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("report-definitions/{id}")]
    public async Task<IActionResult> DeleteReportDefinition(Guid id)
    {
        await _mediator.Send(new DeleteReportDefinitionCommand(id));
        return NoContent();
    }

    [HttpPost("reports/preview")]
    public async Task<ActionResult<ReportPreviewDto>> PreviewReport([FromBody] PreviewReportQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("reports/run")]
    public async Task<ActionResult<ReportResultDto>> RunReport([FromBody] RunReportQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("reports/{id}/export")]
    public async Task<IActionResult> ExportReport(Guid id, [FromQuery] string format = "csv")
    {
        if (!Enum.TryParse<ReportFormat>(format, true, out var reportFormat))
            return BadRequest($"Invalid format: {format}. Use csv, pdf, or xlsx.");

        var result = await _mediator.Send(new ExportReportQuery(id, reportFormat));
        return File(result.Content, result.ContentType, result.FileName);
    }

    [HttpGet("report-schedules")]
    public async Task<ActionResult<List<ReportScheduleDto>>> GetReportSchedules()
    {
        var result = await _mediator.Send(new GetReportSchedulesQuery());
        return Ok(result);
    }

    [HttpGet("report-schedules/{id}")]
    public async Task<ActionResult<ReportScheduleDto>> GetReportScheduleById(Guid id)
    {
        var result = await _mediator.Send(new GetReportScheduleByIdQuery(id));
        return Ok(result);
    }

    [HttpPost("report-schedules")]
    public async Task<ActionResult<ReportScheduleDto>> CreateReportSchedule([FromBody] CreateReportScheduleCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetReportScheduleById), new { id = result.Id }, result);
    }

    [HttpPut("report-schedules/{id}")]
    public async Task<ActionResult<ReportScheduleDto>> UpdateReportSchedule(Guid id, [FromBody] UpdateReportScheduleCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("report-schedules/{id}")]
    public async Task<IActionResult> DeleteReportSchedule(Guid id)
    {
        await _mediator.Send(new DeleteReportScheduleCommand(id));
        return NoContent();
    }
}
