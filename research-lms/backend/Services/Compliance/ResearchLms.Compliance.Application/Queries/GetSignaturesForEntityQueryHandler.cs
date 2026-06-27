using MediatR;
using ResearchLms.Compliance.Application.DTOs;
using ResearchLms.Compliance.Domain.Interfaces;

namespace ResearchLms.Compliance.Application.Queries;

public class GetSignaturesForEntityQueryHandler : IRequestHandler<GetSignaturesForEntityQuery, IReadOnlyList<SignatureDto>>
{
    private readonly ISignatureRepository _repository;

    public GetSignaturesForEntityQueryHandler(ISignatureRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<SignatureDto>> Handle(GetSignaturesForEntityQuery request, CancellationToken ct)
    {
        var entities = await _repository.GetByEntityAsync(request.EntityType, request.EntityId, ct);
        return entities.Select(e => new SignatureDto
        {
            Id = e.Id,
            SignedEntityType = e.SignedEntityType,
            SignedEntityId = e.SignedEntityId,
            SignerUserId = e.SignerUserId,
            SignerName = e.SignerName,
            SignerEmail = e.SignerEmail,
            SignatureData = e.SignatureData,
            DocumentHash = e.DocumentHash,
            SignedAt = e.SignedAt,
        }).ToList();
    }
}
