using MediatR;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record DeleteAlertRuleCommand(Guid Id) : IRequest<Unit>;

public class DeleteAlertRuleHandler : IRequestHandler<DeleteAlertRuleCommand, Unit>
{
    private readonly IIoTRuleRepository _repo;
    private readonly ICurrentUser _user;

    public DeleteAlertRuleHandler(IIoTRuleRepository repo, ICurrentUser user)
    {
        _repo = repo;
        _user = user;
    }

    public async Task<Unit> Handle(DeleteAlertRuleCommand request, CancellationToken ct)
    {
        var rule = await _repo.GetByIdAsync(request.Id, ct);
        if (rule == null) throw new KeyNotFoundException("Alert rule not found.");
        rule.MarkDeleted(_user.Name);
        await _repo.DeleteAsync(rule, ct);
        return Unit.Value;
    }
}
