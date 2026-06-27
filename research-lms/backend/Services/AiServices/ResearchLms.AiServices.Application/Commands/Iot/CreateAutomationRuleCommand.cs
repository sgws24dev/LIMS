using MediatR;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record CreateAutomationRuleCommand(string Name, string TriggerType, string TriggerConfig,
    string ActionType, string ActionConfig, bool RequiresApproval) : IRequest<Guid>;

public class CreateAutomationRuleHandler : IRequestHandler<CreateAutomationRuleCommand, Guid>
{
    private readonly IAutomationRuleRepository _repo;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _user;

    public CreateAutomationRuleHandler(IAutomationRuleRepository repo, ITenantContext tenant, ICurrentUser user)
    {
        _repo = repo;
        _tenant = tenant;
        _user = user;
    }

    public async Task<Guid> Handle(CreateAutomationRuleCommand request, CancellationToken ct)
    {
        var rule = new AutomationRule(
            request.Name, Enum.Parse<TriggerType>(request.TriggerType), request.TriggerConfig,
            Enum.Parse<AutomationActionType>(request.ActionType), request.ActionConfig, request.RequiresApproval);
        rule.SetTenant(_tenant.TenantId);
        rule.MarkCreated(_user.Name);
        await _repo.AddAsync(rule, ct);
        return rule.Id;
    }
}
