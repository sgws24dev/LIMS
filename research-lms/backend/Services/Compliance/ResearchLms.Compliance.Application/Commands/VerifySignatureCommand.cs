using MediatR;

namespace ResearchLms.Compliance.Application.Commands;

public record VerifySignatureCommand(Guid SignatureId, string DocumentContext) : IRequest<bool>;
