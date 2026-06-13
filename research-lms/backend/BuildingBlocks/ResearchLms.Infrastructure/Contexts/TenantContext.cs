using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Infrastructure.Contexts;

public class TenantContext : ITenantContext
{
    public Guid TenantId { get; private set; }
    public string TenantName { get; private set; } = string.Empty;

    public void SetTenant(Guid tenantId, string tenantName)
    {
        TenantId = tenantId;
        TenantName = tenantName;
    }
}
