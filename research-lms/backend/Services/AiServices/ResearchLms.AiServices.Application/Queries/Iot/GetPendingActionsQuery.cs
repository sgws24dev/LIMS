using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Queries.Iot;

public record GetPendingActionsQuery : IRequest<List<PendingActionDto>>;

public class GetPendingActionsHandler : IRequestHandler<GetPendingActionsQuery, List<PendingActionDto>>
{
    private readonly IAutomationActionLogRepository _logRepo;
    private readonly IAutomationRuleRepository _ruleRepo;
    private readonly ITenantContext _tenant;

    public GetPendingActionsHandler(IAutomationActionLogRepository logRepo, IAutomationRuleRepository ruleRepo, ITenantContext tenant)
    {
        _logRepo = logRepo;
        _ruleRepo = ruleRepo;
        _tenant = tenant;
    }

    public async Task<List<PendingActionDto>> Handle(GetPendingActionsQuery request, CancellationToken ct)
    {
        var logs = await _logRepo.GetPendingByTenantAsync(_tenant.TenantId, ct);
        var ruleIds = logs.Select(l => l.RuleId).Distinct();
        var rules = (await Task.WhenAll(ruleIds.Select(id => _ruleRepo.GetByIdAsync(id, ct))))
            .Where(r => r != null)
            .ToDictionary(r => r!.Id, r => r!.Name);

        return logs.Select(l => new PendingActionDto(
            l.Id, l.RuleId, rules.GetValueOrDefault(l.RuleId, "Unknown"),
            l.TriggerEvent, l.ActionExecuted, l.ExecutedAt
        )).ToList();
    }
}
