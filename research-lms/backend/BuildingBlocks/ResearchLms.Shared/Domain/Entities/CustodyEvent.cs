using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public class CustodyEvent : BaseEntity
{
    public Guid AssetId { get; private set; }
    public string? FromUserId { get; private set; }
    public string ToUserId { get; private set; } = string.Empty;
    public string? FromUserName { get; private set; }
    public string ToUserName { get; private set; } = string.Empty;
    public string? FromLocation { get; private set; }
    public string ToLocation { get; private set; } = string.Empty;
    public DateTime TransferredAt { get; private set; }
    public string? Reason { get; private set; }
    public string? SignatureRef { get; private set; }
    public string? Notes { get; private set; }

    public Asset? Asset { get; private set; }

    private CustodyEvent() { }

    public CustodyEvent(
        Guid assetId,
        string? fromUserId,
        string toUserId,
        string? fromUserName,
        string toUserName,
        string? fromLocation,
        string toLocation,
        string? reason,
        string? signatureRef,
        string? notes)
    {
        AssetId = assetId;
        FromUserId = fromUserId;
        ToUserId = toUserId;
        FromUserName = fromUserName;
        ToUserName = toUserName;
        FromLocation = fromLocation;
        ToLocation = toLocation;
        TransferredAt = DateTime.UtcNow;
        Reason = reason;
        SignatureRef = signatureRef;
        Notes = notes;
    }
}
