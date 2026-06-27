using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;
using System.Diagnostics;
using System.Text.Json;

namespace ResearchLms.AiServices.Application.Commands.TalkToAction;

public record ExecuteActionCommand(string Utterance) : IRequest<ActionPlanDto>;

public class ExecuteActionHandler : IRequestHandler<ExecuteActionCommand, ActionPlanDto>
{
    private readonly IActionOrchestrator _orchestrator;
    private readonly IGuardrailService _guardrail;
    private readonly IActionLogRepository _logRepo;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _currentUser;

    public ExecuteActionHandler(
        IActionOrchestrator orchestrator,
        IGuardrailService guardrail,
        IActionLogRepository logRepo,
        ITenantContext tenant,
        ICurrentUser currentUser)
    {
        _orchestrator = orchestrator;
        _guardrail = guardrail;
        _logRepo = logRepo;
        _tenant = tenant;
        _currentUser = currentUser;
    }

    public async Task<ActionPlanDto> Handle(ExecuteActionCommand request, CancellationToken ct)
    {
        var plan = await _orchestrator.ParseIntentAsync(request.Utterance, _currentUser.UserId, ct);
        var guardrail = await _guardrail.EvaluateAsync(plan, _currentUser.UserId, ct);

        var log = new ActionLog(_currentUser.UserId, request.Utterance, plan.Intent, plan.ParametersJson);
        log.SetTenant(_tenant.TenantId);
        log.MarkCreated(_currentUser.Name);

        var sw = Stopwatch.StartNew();

        if (!guardrail.IsAllowed)
        {
            log.MarkBlocked(JsonSerializer.Serialize(guardrail), sw.ElapsedMilliseconds);
            await _logRepo.AddAsync(log, ct);
            return new ActionPlanDto(
                plan.Intent, plan.ParametersJson, plan.Confidence,
                plan.SuggestedTool, plan.DryRunPreview, plan.RequiresApproval,
                new GuardrailResultDto(false, guardrail.BlockedReason, false, guardrail.ApproverRoles)
            );
        }

        try
        {
            var result = await ExecuteIntentAsync(plan);
            log.MarkCompleted(result, sw.ElapsedMilliseconds);
            await _logRepo.AddAsync(log, ct);

            return new ActionPlanDto(
                plan.Intent, plan.ParametersJson, plan.Confidence,
                plan.SuggestedTool, result, false,
                new GuardrailResultDto(true, null, false, Array.Empty<string>())
            );
        }
        catch (Exception ex)
        {
            log.MarkFailed(ex.Message, sw.ElapsedMilliseconds);
            await _logRepo.AddAsync(log, ct);
            throw;
        }
    }

    private Task<string> ExecuteIntentAsync(ActionPlan plan)
    {
        return plan.Intent switch
        {
            "BookInstrument" => Task.FromResult(JsonSerializer.Serialize(new { message = $"Booking created based on: {plan.ParametersJson}" })),
            "CheckAvailability" => Task.FromResult(JsonSerializer.Serialize(new { available = true, slots = new[] { "2026-07-01 09:00", "2026-07-01 10:00" } })),
            "GetInstrumentStatus" => Task.FromResult(JsonSerializer.Serialize(new { status = "Available", lastMaintenance = "2026-05-15" })),
            "CheckCompetencyStatus" => Task.FromResult(JsonSerializer.Serialize(new { status = "Active", expiresAt = "2027-01-01" })),
            _ => Task.FromResult(JsonSerializer.Serialize(new { message = $"Action '{plan.Intent}' executed (mock)." }))
        };
    }
}
