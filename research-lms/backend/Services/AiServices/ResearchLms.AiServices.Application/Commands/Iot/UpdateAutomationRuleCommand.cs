using MediatR;
using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record UpdateAutomationRuleCommand(Guid Id, string Name, string TriggerType, string TriggerConfig,
    string ActionType, string ActionConfig, bool RequiresApproval) : IRequest<Unit>;

public class UpdateAutomationRuleHandler : IRequestHandler<UpdateAutomationRuleCommand, Unit>
{
    private readonly IAutomationRuleRepository _repo;
    private readonly ICurrentUser _user;

    public UpdateAutomationRuleHandler(IAutomationRuleRepository repo, ICurrentUser user)
    {
        _repo = repo;
        _user = user;
    }

    public async Task<Unit> Handle(UpdateAutomationRuleCommand request, CancellationToken ct)
    {
        var rule = await _repo.GetByIdAsync(request.Id, ct);
        if (rule == null) throw new KeyNotFoundException("Automation rule not found.");
        rule.Update(request.Name, Enum.Parse<TriggerType>(request.TriggerType), request.TriggerConfig,
            Enum.Parse<AutomationActionType>(request.ActionType), request.ActionConfig, request.RequiresApproval);
        rule.MarkUpdated(_user.Name);
        await _repo.UpdateAsync(rule, ct);
        return Unit.Value;
    }
}
