using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public sealed class UserRole : BaseEntity
{
    private UserRole() { }

    public UserRole(Guid userId, Guid roleId, string assignedBy)
    {
        UserId = userId;
        RoleId = roleId;
        AssignedAt = DateTime.UtcNow;
        AssignedBy = assignedBy ?? string.Empty;
    }

    public Guid UserId { get; private set; }
    public Guid RoleId { get; private set; }
    public DateTime AssignedAt { get; private set; }
    public string AssignedBy { get; private set; } = string.Empty;
}
