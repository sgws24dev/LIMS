using MediatR;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Enums;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record CreatePublicationCommand(
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
) : IRequest<Guid>;

public class CreatePublicationCommandHandler : IRequestHandler<CreatePublicationCommand, Guid>
{
    private readonly IPublicationRepository _repository;

    public CreatePublicationCommandHandler(IPublicationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CreatePublicationCommand request, CancellationToken ct)
    {
        var publication = new Publication(
            request.Title, request.Authors, request.Journal, request.Doi, request.PmId,
            request.PublicationDate, request.Type, request.Link, request.Abstract, request.IsVerified);

        await _repository.AddAsync(publication, ct);

        if (request.InstrumentIds?.Count > 0)
        {
            foreach (var instrumentId in request.InstrumentIds)
                await _repository.AddInstrumentLinkAsync(publication.Id, instrumentId, ct);
        }

        return publication.Id;
    }
}
