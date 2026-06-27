using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.AiServices.Application.Commands.Iot;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Application.Queries.Iot;

namespace ResearchLms.AiServices.Api.Controllers;

[ApiController]
[Route("api/v1/ai/iot")]
public class IoToController : ControllerBase
{
    private readonly IMediator _mediator;

    public IoToController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("telemetry")]
    [AllowAnonymous]
    public async Task<ActionResult> IngestTelemetry([FromBody] IngestTelemetryRequest request)
    {
        await _mediator.Send(new IngestTelemetryCommand(
            request.InstrumentId, request.Timestamp, request.MetricName,
            request.MetricValue, request.Unit, request.Tags));
        return Ok();
    }

    [HttpGet("telemetry")]
    [Authorize]
    public async Task<ActionResult<List<IoTTelemetryDto>>> GetTelemetry(
        [FromQuery] Guid instrumentId, [FromQuery] string? metricName,
        [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _mediator.Send(new GetTelemetryQuery(instrumentId, metricName, from, to));
        return Ok(result);
    }

    [HttpGet("instruments/{instrumentId:guid}/status")]
    [Authorize]
    public async Task<ActionResult<InstrumentStatusDto>> GetInstrumentStatus(Guid instrumentId)
    {
        var result = await _mediator.Send(new GetInstrumentStatusQuery(instrumentId));
        return Ok(result);
    }

    [HttpGet("alerts")]
    [Authorize]
    public async Task<ActionResult<List<IoTAlertDto>>> GetAlerts(
        [FromQuery] Guid? instrumentId, [FromQuery] string? status)
    {
        var result = await _mediator.Send(new GetAlertsQuery(instrumentId, status));
        return Ok(result);
    }

    [HttpPut("alerts/{id:guid}/acknowledge")]
    [Authorize]
    public async Task<ActionResult> AcknowledgeAlert(Guid id)
    {
        await _mediator.Send(new AcknowledgeAlertCommand(id));
        return Ok();
    }

    [HttpPut("alerts/{id:guid}/resolve")]
    [Authorize]
    public async Task<ActionResult> ResolveAlert(Guid id)
    {
        await _mediator.Send(new ResolveAlertCommand(id));
        return Ok();
    }

    [HttpGet("alert-rules")]
    [Authorize]
    public async Task<ActionResult<List<AlertRuleDto>>> GetAlertRules([FromQuery] Guid? instrumentId)
    {
        var result = await _mediator.Send(new GetAlertRulesQuery(instrumentId));
        return Ok(result);
    }

    [HttpPost("alert-rules")]
    [Authorize]
    public async Task<ActionResult<Guid>> CreateAlertRule([FromBody] CreateAlertRuleRequest request)
    {
        var id = await _mediator.Send(new CreateAlertRuleCommand(
            request.InstrumentId, request.MetricName, request.ConditionType,
            request.ThresholdValue, request.EvaluationWindowMinutes, request.Severity, request.CooldownMinutes));
        return Ok(id);
    }

    [HttpPut("alert-rules/{id:guid}")]
    [Authorize]
    public async Task<ActionResult> UpdateAlertRule(Guid id, [FromBody] CreateAlertRuleRequest request)
    {
        await _mediator.Send(new UpdateAlertRuleCommand(
            id, request.MetricName, request.ConditionType, request.ThresholdValue,
            request.EvaluationWindowMinutes, request.Severity, request.CooldownMinutes));
        return Ok();
    }

    [HttpDelete("alert-rules/{id:guid}")]
    [Authorize]
    public async Task<ActionResult> DeleteAlertRule(Guid id)
    {
        await _mediator.Send(new DeleteAlertRuleCommand(id));
        return Ok();
    }

    [HttpPatch("alert-rules/{id:guid}/toggle")]
    [Authorize]
    public async Task<ActionResult> ToggleAlertRule(Guid id, [FromBody] bool isEnabled)
    {
        await _mediator.Send(new ToggleAlertRuleCommand(id, isEnabled));
        return Ok();
    }

    [HttpGet("automation-rules")]
    [Authorize]
    public async Task<ActionResult<List<AutomationRuleDto>>> GetAutomationRules()
    {
        var result = await _mediator.Send(new GetAutomationRulesQuery());
        return Ok(result);
    }

    [HttpPost("automation-rules")]
    [Authorize]
    public async Task<ActionResult<Guid>> CreateAutomationRule([FromBody] CreateAutomationRuleRequest request)
    {
        var id = await _mediator.Send(new CreateAutomationRuleCommand(
            request.Name, request.TriggerType, request.TriggerConfig,
            request.ActionType, request.ActionConfig, request.RequiresApproval));
        return Ok(id);
    }

    [HttpPut("automation-rules/{id:guid}")]
    [Authorize]
    public async Task<ActionResult> UpdateAutomationRule(Guid id, [FromBody] CreateAutomationRuleRequest request)
    {
        await _mediator.Send(new UpdateAutomationRuleCommand(
            id, request.Name, request.TriggerType, request.TriggerConfig,
            request.ActionType, request.ActionConfig, request.RequiresApproval));
        return Ok();
    }

    [HttpDelete("automation-rules/{id:guid}")]
    [Authorize]
    public async Task<ActionResult> DeleteAutomationRule(Guid id)
    {
        await _mediator.Send(new DeleteAutomationRuleCommand(id));
        return Ok();
    }

    [HttpPatch("automation-rules/{id:guid}/toggle")]
    [Authorize]
    public async Task<ActionResult> ToggleAutomationRule(Guid id, [FromBody] bool isEnabled)
    {
        await _mediator.Send(new ToggleAutomationRuleCommand(id, isEnabled));
        return Ok();
    }

    [HttpGet("automation-rules/pending-actions")]
    [Authorize]
    public async Task<ActionResult<List<PendingActionDto>>> GetPendingActions()
    {
        var result = await _mediator.Send(new GetPendingActionsQuery());
        return Ok(result);
    }

    [HttpPut("automation-rules/pending-actions/{id:guid}/approve")]
    [Authorize]
    public async Task<ActionResult> ApproveAction(Guid id)
    {
        await _mediator.Send(new ApproveAutomationActionCommand(id, true));
        return Ok();
    }

    [HttpPut("automation-rules/pending-actions/{id:guid}/reject")]
    [Authorize]
    public async Task<ActionResult> RejectAction(Guid id)
    {
        await _mediator.Send(new ApproveAutomationActionCommand(id, false));
        return Ok();
    }
}
