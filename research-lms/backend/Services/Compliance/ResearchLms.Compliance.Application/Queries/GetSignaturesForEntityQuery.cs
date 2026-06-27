using MediatR;
using ResearchLms.Compliance.Application.DTOs;

namespace ResearchLms.Compliance.Application.Queries;

public record GetSignaturesForEntityQuery(string EntityType, Guid EntityId) : IRequest<IReadOnlyList<SignatureDto>>;
