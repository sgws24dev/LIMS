using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Queries.Iot;

public record GetAlertRulesQuery(Guid? InstrumentId = null) : IRequest<List<AlertRuleDto>>;

public class GetAlertRulesHandler : IRequestHandler<GetAlertRulesQuery, List<AlertRuleDto>>
{
    private readonly IIoTRuleRepository _repo;
    private readonly ITenantContext _tenant;

    public GetAlertRulesHandler(IIoTRuleRepository repo, ITenantContext tenant)
    {
        _repo = repo;
        _tenant = tenant;
    }

    public async Task<List<AlertRuleDto>> Handle(GetAlertRulesQuery request, CancellationToken ct)
    {
        var rules = await _repo.GetByTenantAsync(_tenant.TenantId, request.InstrumentId, ct);
        return rules.Select(r => new AlertRuleDto(
            r.Id, r.InstrumentId, r.MetricName, r.ConditionType.ToString(),
            r.ThresholdValue, r.EvaluationWindowMinutes, r.Severity.ToString(),
            r.CooldownMinutes, r.IsEnabled
        )).ToList();
    }
}
