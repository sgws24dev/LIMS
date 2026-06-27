using MediatR;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record DeleteAutomationRuleCommand(Guid Id) : IRequest<Unit>;

public class DeleteAutomationRuleHandler : IRequestHandler<DeleteAutomationRuleCommand, Unit>
{
    private readonly IAutomationRuleRepository _repo;
    private readonly ICurrentUser _user;

    public DeleteAutomationRuleHandler(IAutomationRuleRepository repo, ICurrentUser user)
    {
        _repo = repo;
        _user = user;
    }

    public async Task<Unit> Handle(DeleteAutomationRuleCommand request, CancellationToken ct)
    {
        var rule = await _repo.GetByIdAsync(request.Id, ct);
        if (rule == null) throw new KeyNotFoundException("Automation rule not found.");
        rule.MarkDeleted(_user.Name);
        await _repo.DeleteAsync(rule, ct);
        return Unit.Value;
    }
}
