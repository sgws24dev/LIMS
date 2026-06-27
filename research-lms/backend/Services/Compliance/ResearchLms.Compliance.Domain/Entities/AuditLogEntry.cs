using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Compliance.Domain.Entities;

public class AuditLogEntry : BaseEntity
{
    public string EntityType { get; private set; }
    public Guid EntityId { get; private set; }
    public string Operation { get; private set; }
    public string? PreviousValues { get; private set; }
    public string? NewValues { get; private set; }
    public string ChangedByUserId { get; private set; }
    public string ChangedByUserName { get; private set; }
    public string ChangeReason { get; private set; }
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public DateTime Timestamp { get; private set; }
    public string? PreviousHash { get; private set; }
    public string CurrentHash { get; private set; }

    private AuditLogEntry() { EntityType = null!; Operation = null!; ChangedByUserId = null!; ChangedByUserName = null!; ChangeReason = null!; CurrentHash = null!; }

    public AuditLogEntry(
        string entityType, Guid entityId, string operation,
        string? previousValues, string? newValues,
        string changedByUserId, string changedByUserName,
        string changeReason, string? ipAddress, string? userAgent,
        string? previousHash, string currentHash, string createdBy)
    {
        EntityType = entityType;
        EntityId = entityId;
        Operation = operation;
        PreviousValues = previousValues;
        NewValues = newValues;
        ChangedByUserId = changedByUserId;
        ChangedByUserName = changedByUserName;
        ChangeReason = changeReason;
        IpAddress = ipAddress;
        UserAgent = userAgent;
        Timestamp = DateTime.UtcNow;
        PreviousHash = previousHash;
        CurrentHash = currentHash;
        MarkCreated(createdBy);
    }
}
