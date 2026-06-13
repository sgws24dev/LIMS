using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public sealed class RefreshToken : BaseEntity
{
    private RefreshToken() { }

    public RefreshToken(Guid userId, string token, DateTime expiresAt, string createdByIp)
    {
        UserId = userId;
        Token = token;
        ExpiresAt = expiresAt;
        CreatedByIp = createdByIp ?? string.Empty;
    }

    public Guid UserId { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public string CreatedByIp { get; private set; } = string.Empty;
    public DateTime? RevokedAt { get; private set; }
    public string? RevokedByIp { get; private set; }
    public string? ReplacedByToken { get; private set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsExpired && RevokedAt is null && !IsDeleted;

    public void Revoke(string revokedByIp, string? replacedByToken = null)
    {
        if (RevokedAt is not null)
            return;

        RevokedAt = DateTime.UtcNow;
        RevokedByIp = revokedByIp;
        ReplacedByToken = replacedByToken;
    }
}
