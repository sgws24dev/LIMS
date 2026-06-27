using MediatR;
using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record UpdateAlertRuleCommand(Guid Id, string MetricName, string ConditionType,
    double ThresholdValue, int EvaluationWindowMinutes, string Severity, int CooldownMinutes) : IRequest<Unit>;

public class UpdateAlertRuleHandler : IRequestHandler<UpdateAlertRuleCommand, Unit>
{
    private readonly IIoTRuleRepository _repo;
    private readonly ICurrentUser _user;

    public UpdateAlertRuleHandler(IIoTRuleRepository repo, ICurrentUser user)
    {
        _repo = repo;
        _user = user;
    }

    public async Task<Unit> Handle(UpdateAlertRuleCommand request, CancellationToken ct)
    {
        var rule = await _repo.GetByIdAsync(request.Id, ct);
        if (rule == null) throw new KeyNotFoundException("Alert rule not found.");
        rule.Update(request.MetricName, Enum.Parse<ConditionType>(request.ConditionType),
            request.ThresholdValue, request.EvaluationWindowMinutes,
            Enum.Parse<AlertSeverity>(request.Severity), request.CooldownMinutes);
        rule.MarkUpdated(_user.Name);
        await _repo.UpdateAsync(rule, ct);
        return Unit.Value;
    }
}
