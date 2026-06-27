using MediatR;
using ResearchLms.Compliance.Application.DTOs;

namespace ResearchLms.Compliance.Application.Commands;

public record CaptureSignatureCommand(
    string SignedEntityType, Guid SignedEntityId,
    string SignerName, string SignerEmail,
    string SignatureData, string DocumentContext
) : IRequest<SignatureDto>;
