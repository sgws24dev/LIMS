using MediatR;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record DeletePublicationCommand(Guid Id) : IRequest;

public class DeletePublicationCommandHandler : IRequestHandler<DeletePublicationCommand>
{
    private readonly IPublicationRepository _repository;

    public DeletePublicationCommandHandler(IPublicationRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeletePublicationCommand request, CancellationToken ct)
    {
        await _repository.DeleteAsync(request.Id, ct);
    }
}
