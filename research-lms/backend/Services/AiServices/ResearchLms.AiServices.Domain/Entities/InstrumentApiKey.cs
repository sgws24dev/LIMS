using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class InstrumentApiKey : BaseEntity
{
    public Guid InstrumentId { get; private set; }
    public string ApiKeyHash { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public DateTime? LastUsedAt { get; private set; }

    protected InstrumentApiKey() { }

    public InstrumentApiKey(Guid instrumentId, string apiKeyHash, string description, DateTime? expiresAt = null)
    {
        InstrumentId = instrumentId;
        ApiKeyHash = apiKeyHash;
        Description = description;
        IsActive = true;
        ExpiresAt = expiresAt;
    }

    public void MarkUsed() => LastUsedAt = DateTime.UtcNow;
    public void Deactivate() => IsActive = false;
}
