namespace ResearchLms.Shared.Abstractions;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; }
    public Guid TenantId { get; protected set; }
    public DateTime CreatedAt { get; protected set; }
    public string CreatedBy { get; protected set; } = string.Empty;
    public DateTime? UpdatedAt { get; protected set; }
    public string? UpdatedBy { get; protected set; }
    public bool IsDeleted { get; protected set; }
    public DateTime? DeletedAt { get; protected set; }
    public string? DeletedBy { get; protected set; }

    private readonly List<IEvent> _domainEvents = new();
    public IReadOnlyCollection<IEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
    }

    protected void AddDomainEvent(IEvent domainEvent) => _domainEvents.Add(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();
    public void SetTenant(Guid tenantId) => TenantId = tenantId;
    public void MarkCreated(string by) { CreatedBy = by; CreatedAt = DateTime.UtcNow; }
    public void MarkUpdated(string by) { UpdatedBy = by; UpdatedAt = DateTime.UtcNow; }
    public void MarkDeleted(string by) { IsDeleted = true; DeletedBy = by; DeletedAt = DateTime.UtcNow; }
}
