using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Queries.Iot;

public record GetAutomationRulesQuery : IRequest<List<AutomationRuleDto>>;

public class GetAutomationRulesHandler : IRequestHandler<GetAutomationRulesQuery, List<AutomationRuleDto>>
{
    private readonly IAutomationRuleRepository _repo;
    private readonly ITenantContext _tenant;

    public GetAutomationRulesHandler(IAutomationRuleRepository repo, ITenantContext tenant)
    {
        _repo = repo;
        _tenant = tenant;
    }

    public async Task<List<AutomationRuleDto>> Handle(GetAutomationRulesQuery request, CancellationToken ct)
    {
        var rules = await _repo.GetByTenantAsync(_tenant.TenantId, ct);
        return rules.Select(r => new AutomationRuleDto(
            r.Id, r.Name, r.TriggerType.ToString(), r.TriggerConfig,
            r.ActionType.ToString(), r.ActionConfig, r.RequiresApproval, r.IsEnabled
        )).ToList();
    }
}
