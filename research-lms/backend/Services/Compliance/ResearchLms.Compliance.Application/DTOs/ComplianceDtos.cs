namespace ResearchLms.Compliance.Application.DTOs;

public class AuditLogEntryDto
{
    public Guid Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string Operation { get; set; } = string.Empty;
    public string? PreviousValues { get; set; }
    public string? NewValues { get; set; }
    public string ChangedByUserId { get; set; } = string.Empty;
    public string ChangedByUserName { get; set; } = string.Empty;
    public string ChangeReason { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; }
    public string? PreviousHash { get; set; }
    public string CurrentHash { get; set; } = string.Empty;
    public bool HashIntegrityVerified { get; set; }
}

public class SignatureDto
{
    public Guid Id { get; set; }
    public string SignedEntityType { get; set; } = string.Empty;
    public Guid SignedEntityId { get; set; }
    public string SignerUserId { get; set; } = string.Empty;
    public string SignerName { get; set; } = string.Empty;
    public string SignerEmail { get; set; } = string.Empty;
    public string SignatureData { get; set; } = string.Empty;
    public string DocumentHash { get; set; } = string.Empty;
    public DateTime SignedAt { get; set; }
}

public class HashChainVerificationDto
{
    public bool IsIntact { get; set; }
    public string? TamperedEntryId { get; set; }
    public string? ComputedHash { get; set; }
    public string? StoredHash { get; set; }
}
