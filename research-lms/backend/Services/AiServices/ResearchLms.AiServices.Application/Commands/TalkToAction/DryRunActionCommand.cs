using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.TalkToAction;

public record DryRunActionCommand(string Utterance) : IRequest<ActionPlanDto>;

public class DryRunActionHandler : IRequestHandler<DryRunActionCommand, ActionPlanDto>
{
    private readonly IActionOrchestrator _orchestrator;
    private readonly IGuardrailService _guardrail;
    private readonly ICurrentUser _currentUser;

    public DryRunActionHandler(IActionOrchestrator orchestrator, IGuardrailService guardrail, ICurrentUser currentUser)
    {
        _orchestrator = orchestrator;
        _guardrail = guardrail;
        _currentUser = currentUser;
    }

    public async Task<ActionPlanDto> Handle(DryRunActionCommand request, CancellationToken ct)
    {
        var plan = await _orchestrator.ParseIntentAsync(request.Utterance, _currentUser.UserId, ct);
        var guardrail = await _guardrail.EvaluateAsync(plan, _currentUser.UserId, ct);

        return new ActionPlanDto(
            plan.Intent,
            plan.ParametersJson,
            plan.Confidence,
            plan.SuggestedTool,
            plan.DryRunPreview,
            plan.RequiresApproval || guardrail.RequiresApproval,
            new GuardrailResultDto(
                guardrail.IsAllowed,
                guardrail.BlockedReason,
                guardrail.RequiresApproval,
                guardrail.ApproverRoles
            )
        );
    }
}
