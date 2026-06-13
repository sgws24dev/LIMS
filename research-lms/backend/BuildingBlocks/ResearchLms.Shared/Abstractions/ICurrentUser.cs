namespace ResearchLms.Shared.Abstractions;

public interface ICurrentUser
{
    Guid UserId { get; }
    string Email { get; }
    string Name { get; }
    string[] Roles { get; }
    Guid TenantId { get; }
    bool IsAuthenticated { get; }
}
