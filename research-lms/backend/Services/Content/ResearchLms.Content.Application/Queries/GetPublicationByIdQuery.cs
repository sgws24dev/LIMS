using MediatR;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Queries;

public record GetPublicationByIdQuery(Guid Id) : IRequest<PublicationDto?>;

public class GetPublicationByIdQueryHandler : IRequestHandler<GetPublicationByIdQuery, PublicationDto?>
{
    private readonly IPublicationRepository _repository;

    public GetPublicationByIdQueryHandler(IPublicationRepository repository) => _repository = repository;

    public async Task<PublicationDto?> Handle(GetPublicationByIdQuery request, CancellationToken ct)
    {
        var p = await _repository.GetByIdAsync(request.Id, ct);
        if (p == null) return null;

        return new PublicationDto(
            p.Id, p.Title, p.GetAuthors(), p.Journal, p.Doi, p.PmId,
            p.PublicationDate, p.Type.ToString(), p.Link, p.Abstract,
            p.GetAttachments(), p.IsVerified, p.CreatedAt
        );
    }
}
