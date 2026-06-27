using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Compliance.Domain.Entities;

public class Signature : BaseEntity
{
    public string SignedEntityType { get; private set; }
    public Guid SignedEntityId { get; private set; }
    public string SignerUserId { get; private set; }
    public string SignerName { get; private set; }
    public string SignerEmail { get; private set; }
    public string SignatureData { get; private set; }
    public string DocumentHash { get; private set; }
    public DateTime SignedAt { get; private set; }
    public string? IpAddress { get; private set; }

    private Signature() { SignedEntityType = null!; SignerUserId = null!; SignerName = null!; SignerEmail = null!; SignatureData = null!; DocumentHash = null!; }

    public Signature(
        string signedEntityType, Guid signedEntityId,
        string signerUserId, string signerName, string signerEmail,
        string signatureData, string documentHash, string? ipAddress, string createdBy)
    {
        SignedEntityType = signedEntityType;
        SignedEntityId = signedEntityId;
        SignerUserId = signerUserId;
        SignerName = signerName;
        SignerEmail = signerEmail;
        SignatureData = signatureData;
        DocumentHash = documentHash;
        SignedAt = DateTime.UtcNow;
        IpAddress = ipAddress;
        MarkCreated(createdBy);
    }
}
