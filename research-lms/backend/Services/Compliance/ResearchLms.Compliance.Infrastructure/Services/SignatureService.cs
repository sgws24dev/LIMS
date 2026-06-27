using System.Security.Cryptography;
using System.Text;
using ResearchLms.Compliance.Domain.Entities;
using ResearchLms.Compliance.Domain.Interfaces;

namespace ResearchLms.Compliance.Infrastructure.Services;

public class SignatureService : ISignatureService
{
    private readonly ISignatureRepository _repository;

    public SignatureService(ISignatureRepository repository)
    {
        _repository = repository;
    }

    public async Task<Signature> CaptureAsync(
        string signerUserId, string signerName, string signerEmail,
        string signedEntityType, Guid signedEntityId,
        string signatureData, string documentContext, string? ipAddress, CancellationToken ct = default)
    {
        var documentHash = ComputeDocumentHash(documentContext);

        var signature = new Signature(
            signedEntityType, signedEntityId,
            signerUserId, signerName, signerEmail,
            signatureData, documentHash, ipAddress, "system");

        await _repository.AddAsync(signature, ct);
        return signature;
    }

    public async Task<bool> VerifyAsync(Guid signatureId, string documentContext, CancellationToken ct = default)
    {
        var signature = await _repository.GetByIdAsync(signatureId, ct);
        if (signature == null) return false;

        var computedHash = ComputeDocumentHash(documentContext);
        return signature.DocumentHash.Equals(computedHash, StringComparison.OrdinalIgnoreCase);
    }

    private static string ComputeDocumentHash(string documentContext)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(documentContext));
        return Convert.ToHexStringLower(bytes);
    }
}
