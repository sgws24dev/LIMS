using MediatR;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record ToggleAlertRuleCommand(Guid Id, bool IsEnabled) : IRequest<Unit>;

public class ToggleAlertRuleHandler : IRequestHandler<ToggleAlertRuleCommand, Unit>
{
    private readonly IIoTRuleRepository _repo;

    public ToggleAlertRuleHandler(IIoTRuleRepository repo)
    {
        _repo = repo;
    }

    public async Task<Unit> Handle(ToggleAlertRuleCommand request, CancellationToken ct)
    {
        var rule = await _repo.GetByIdAsync(request.Id, ct);
        if (rule == null) throw new KeyNotFoundException("Alert rule not found.");
        rule.SetEnabled(request.IsEnabled);
        await _repo.UpdateAsync(rule, ct);
        return Unit.Value;
    }
}
