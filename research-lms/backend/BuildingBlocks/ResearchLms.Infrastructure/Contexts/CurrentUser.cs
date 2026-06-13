using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Infrastructure.Contexts;

public class CurrentUser : ICurrentUser
{
    public Guid UserId { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string[] Roles { get; private set; } = Array.Empty<string>();
    public Guid TenantId { get; private set; }
    public bool IsAuthenticated { get; private set; }

    public void SetUser(Guid userId, string email, string name, string[] roles, Guid tenantId)
    {
        UserId = userId;
        Email = email;
        Name = name;
        Roles = roles;
        TenantId = tenantId;
        IsAuthenticated = true;
    }
}
