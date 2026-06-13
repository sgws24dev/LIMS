using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Exceptions;

namespace ResearchLms.Shared.Domain.Entities;

public sealed class Tenant : BaseEntity
{
    private Tenant() { }

    private Tenant(string name, string code, string? domain, string? contactEmail)
    {
        Name = name;
        Code = code;
        Domain = domain;
        ContactEmail = contactEmail;
        IsActive = true;
    }

    public string Name { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public string? Domain { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? SubscriptionPlan { get; private set; }
    public bool IsActive { get; private set; }
    public string? ContactEmail { get; private set; }
    public string? ContactPhone { get; private set; }
    public string? Address { get; private set; }
    public string? Settings { get; set; }

    public static Tenant Create(string name, string code, string? domain, string? contactEmail)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(code);

        return new Tenant(name.Trim(), code.Trim().ToLowerInvariant(), domain?.Trim(), contactEmail?.Trim());
    }

    public void Activate()
    {
        if (IsActive)
            throw new DomainException("TENANT_ALREADY_ACTIVE", "Tenant is already active.");

        IsActive = true;
        MarkUpdated(nameof(Tenant));
    }

    public void Suspend()
    {
        if (!IsActive)
            throw new DomainException("TENANT_ALREADY_SUSPENDED", "Tenant is already suspended.");

        IsActive = false;
        MarkUpdated(nameof(Tenant));
    }

    public void UpdateDetails(string name, string? domain, string? logoUrl, string? contactEmail, string? contactPhone, string? address)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Name = name.Trim();
        Domain = domain?.Trim();
        LogoUrl = logoUrl?.Trim();
        ContactEmail = contactEmail?.Trim();
        ContactPhone = contactPhone?.Trim();
        Address = address?.Trim();

        MarkUpdated(nameof(Tenant));
    }

    public void SetSubscriptionPlan(string plan)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(plan);

        SubscriptionPlan = plan.Trim();
        MarkUpdated(nameof(Tenant));
    }
}
