using MediatR;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record ApproveAutomationActionCommand(Guid ActionId, bool Approved) : IRequest<Unit>;

public class ApproveAutomationActionHandler : IRequestHandler<ApproveAutomationActionCommand, Unit>
{
    private readonly IAutomationService _automation;
    private readonly ICurrentUser _user;

    public ApproveAutomationActionHandler(IAutomationService automation, ICurrentUser user)
    {
        _automation = automation;
        _user = user;
    }

    public async Task<Unit> Handle(ApproveAutomationActionCommand request, CancellationToken ct)
    {
        if (request.Approved)
            await _automation.ApproveActionAsync(request.ActionId, _user.UserId, ct);
        else
            await _automation.RejectActionAsync(request.ActionId, ct);
        return Unit.Value;
    }
}
