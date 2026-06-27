using MediatR;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record ResolveAlertCommand(Guid Id) : IRequest<Unit>;

public class ResolveAlertHandler : IRequestHandler<ResolveAlertCommand, Unit>
{
    private readonly IIoTAlertRepository _repo;
    private readonly ICurrentUser _user;

    public ResolveAlertHandler(IIoTAlertRepository repo, ICurrentUser user)
    {
        _repo = repo;
        _user = user;
    }

    public async Task<Unit> Handle(ResolveAlertCommand request, CancellationToken ct)
    {
        var alert = await _repo.GetByIdAsync(request.Id, ct);
        if (alert == null) throw new KeyNotFoundException("Alert not found.");
        alert.Resolve(_user.UserId);
        await _repo.UpdateAsync(alert, ct);
        return Unit.Value;
    }
}
