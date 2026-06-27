using MediatR;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Application.Commands.Iot;

public record AcknowledgeAlertCommand(Guid Id) : IRequest<Unit>;

public class AcknowledgeAlertHandler : IRequestHandler<AcknowledgeAlertCommand, Unit>
{
    private readonly IIoTAlertRepository _repo;

    public AcknowledgeAlertHandler(IIoTAlertRepository repo)
    {
        _repo = repo;
    }

    public async Task<Unit> Handle(AcknowledgeAlertCommand request, CancellationToken ct)
    {
        var alert = await _repo.GetByIdAsync(request.Id, ct);
        if (alert == null) throw new KeyNotFoundException("Alert not found.");
        alert.Acknowledge();
        await _repo.UpdateAsync(alert, ct);
        return Unit.Value;
    }
}
