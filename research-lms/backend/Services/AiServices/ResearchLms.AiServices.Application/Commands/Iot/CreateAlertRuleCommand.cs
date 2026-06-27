using MediatR;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record CreateAlertRuleCommand(Guid InstrumentId, string MetricName, string ConditionType,
    double ThresholdValue, int EvaluationWindowMinutes, string Severity, int CooldownMinutes) : IRequest<Guid>;

public class CreateAlertRuleHandler : IRequestHandler<CreateAlertRuleCommand, Guid>
{
    private readonly IIoTRuleRepository _repo;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _user;

    public CreateAlertRuleHandler(IIoTRuleRepository repo, ITenantContext tenant, ICurrentUser user)
    {
        _repo = repo;
        _tenant = tenant;
        _user = user;
    }

    public async Task<Guid> Handle(CreateAlertRuleCommand request, CancellationToken ct)
    {
        var rule = new IoTRule(
            request.InstrumentId, request.MetricName,
            Enum.Parse<ConditionType>(request.ConditionType),
            request.ThresholdValue, request.EvaluationWindowMinutes,
            Enum.Parse<AlertSeverity>(request.Severity), request.CooldownMinutes);
        rule.SetTenant(_tenant.TenantId);
        rule.MarkCreated(_user.Name);
        await _repo.AddAsync(rule, ct);
        return rule.Id;
    }
}
