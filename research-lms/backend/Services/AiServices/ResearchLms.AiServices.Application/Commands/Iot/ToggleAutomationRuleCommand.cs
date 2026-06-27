using MediatR;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record ToggleAutomationRuleCommand(Guid Id, bool IsEnabled) : IRequest<Unit>;

public class ToggleAutomationRuleHandler : IRequestHandler<ToggleAutomationRuleCommand, Unit>
{
    private readonly IAutomationRuleRepository _repo;

    public ToggleAutomationRuleHandler(IAutomationRuleRepository repo)
    {
        _repo = repo;
    }

    public async Task<Unit> Handle(ToggleAutomationRuleCommand request, CancellationToken ct)
    {
        var rule = await _repo.GetByIdAsync(request.Id, ct);
        if (rule == null) throw new KeyNotFoundException("Automation rule not found.");
        rule.SetEnabled(request.IsEnabled);
        await _repo.UpdateAsync(rule, ct);
        return Unit.Value;
    }
}
