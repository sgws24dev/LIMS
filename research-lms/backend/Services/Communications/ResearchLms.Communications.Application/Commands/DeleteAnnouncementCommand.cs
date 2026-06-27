using MediatR;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Commands;

public record DeleteAnnouncementCommand(Guid Id) : IRequest;

public class DeleteAnnouncementCommandHandler : IRequestHandler<DeleteAnnouncementCommand>
{
    private readonly IAnnouncementRepository _repository;

    public DeleteAnnouncementCommandHandler(IAnnouncementRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeleteAnnouncementCommand request, CancellationToken ct)
    {
        await _repository.DeleteAsync(request.Id, ct);
    }
}
