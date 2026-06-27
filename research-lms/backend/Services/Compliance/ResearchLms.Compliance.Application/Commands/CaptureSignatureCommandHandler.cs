using MediatR;
using ResearchLms.Compliance.Application.DTOs;
using ResearchLms.Compliance.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Compliance.Application.Commands;

public class CaptureSignatureCommandHandler : IRequestHandler<CaptureSignatureCommand, SignatureDto>
{
    private readonly ISignatureService _signatureService;
    private readonly ICurrentUser _currentUser;

    public CaptureSignatureCommandHandler(ISignatureService signatureService, ICurrentUser currentUser)
    {
        _signatureService = signatureService;
        _currentUser = currentUser;
    }

    public async Task<SignatureDto> Handle(CaptureSignatureCommand request, CancellationToken ct)
    {
        var signature = await _signatureService.CaptureAsync(
            _currentUser.UserId.ToString(), request.SignerName, request.SignerEmail,
            request.SignedEntityType, request.SignedEntityId,
            request.SignatureData, request.DocumentContext,
            null, ct);

        return new SignatureDto
        {
            Id = signature.Id,
            SignedEntityType = signature.SignedEntityType,
            SignedEntityId = signature.SignedEntityId,
            SignerUserId = signature.SignerUserId,
            SignerName = signature.SignerName,
            SignerEmail = signature.SignerEmail,
            SignatureData = signature.SignatureData,
            DocumentHash = signature.DocumentHash,
            SignedAt = signature.SignedAt,
        };
    }
}
