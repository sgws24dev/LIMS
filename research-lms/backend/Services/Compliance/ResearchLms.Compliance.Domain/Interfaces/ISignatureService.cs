using ResearchLms.Compliance.Domain.Entities;

namespace ResearchLms.Compliance.Domain.Interfaces;

public interface ISignatureService
{
    Task<Signature> CaptureAsync(string signerUserId, string signerName, string signerEmail,
        string signedEntityType, Guid signedEntityId, string signatureData, string documentContext, string? ipAddress, CancellationToken ct = default);
    Task<bool> VerifyAsync(Guid signatureId, string documentContext, CancellationToken ct = default);
}
