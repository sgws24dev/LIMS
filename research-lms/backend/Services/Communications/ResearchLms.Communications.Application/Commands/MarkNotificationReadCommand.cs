using MediatR;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Commands;

public record MarkNotificationReadCommand(Guid Id) : IRequest;

public class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand>
{
    private readonly INotificationRepository _repository;

    public MarkNotificationReadCommandHandler(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(MarkNotificationReadCommand request, CancellationToken ct)
    {
        await _repository.MarkAsReadAsync(request.Id, ct);
    }
}
