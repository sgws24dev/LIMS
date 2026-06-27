using MediatR;
using ResearchLms.Compliance.Domain.Interfaces;

namespace ResearchLms.Compliance.Application.Commands;

public class VerifySignatureCommandHandler : IRequestHandler<VerifySignatureCommand, bool>
{
    private readonly ISignatureService _signatureService;

    public VerifySignatureCommandHandler(ISignatureService signatureService)
    {
        _signatureService = signatureService;
    }

    public async Task<bool> Handle(VerifySignatureCommand request, CancellationToken ct)
    {
        return await _signatureService.VerifyAsync(request.SignatureId, request.DocumentContext, ct);
    }
}
