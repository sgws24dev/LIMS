using MediatR;
using ResearchLms.Content.Domain.Enums;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record UpdatePublicationCommand(
    Guid Id,
    string Title,
    string[] Authors,
    string? Journal,
    string? Doi,
    string? PmId,
    DateTime? PublicationDate,
    PublicationType Type,
    string? Link,
    string? Abstract,
    bool IsVerified,
    List<Guid>? InstrumentIds
) : IRequest;

public class UpdatePublicationCommandHandler : IRequestHandler<UpdatePublicationCommand>
{
    private readonly IPublicationRepository _repository;

    public UpdatePublicationCommandHandler(IPublicationRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(UpdatePublicationCommand request, CancellationToken ct)
    {
        var publication = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Publication {request.Id} not found");

        publication.Update(
            request.Title, request.Authors, request.Journal, request.Doi, request.PmId,
            request.PublicationDate, request.Type, request.Link, request.Abstract, request.IsVerified);

        await _repository.UpdateAsync(publication, ct);

        var existingLinks = await _repository.GetLinkedInstrumentIdsAsync(request.Id, ct);
        var toRemove = existingLinks.Except(request.InstrumentIds ?? new()).ToList();
        var toAdd = (request.InstrumentIds ?? new()).Except(existingLinks).ToList();

        foreach (var id in toRemove)
            await _repository.RemoveInstrumentLinkAsync(request.Id, id, ct);
        foreach (var id in toAdd)
            await _repository.AddInstrumentLinkAsync(request.Id, id, ct);
    }
}
