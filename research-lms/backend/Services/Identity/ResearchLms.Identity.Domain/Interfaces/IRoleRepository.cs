namespace ResearchLms.Identity.Domain.Interfaces;

using ResearchLms.Shared.Domain.Entities;

/// <summary>Repository abstraction for <see cref="Role"/> persistence.</summary>
public interface IRoleRepository
{
    /// <summary>Gets a role by its unique identifier.</summary>
    Task<Role?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Gets a role by its name.</summary>
    Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default);

    /// <summary>Gets all roles.</summary>
    Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Adds a new role.</summary>
    Task AddAsync(Role role, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing role.</summary>
    Task UpdateAsync(Role role, CancellationToken cancellationToken = default);

    /// <summary>Deletes (soft) a role by its identifier.</summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Gets the roles assigned to a specific user.</summary>
    Task<IReadOnlyList<Role>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>Gets the permissions for a specific role.</summary>
    Task<IReadOnlyList<Permission>> GetRolePermissionsAsync(Guid roleId, CancellationToken cancellationToken = default);

    /// <summary>Gets ABAC rules for a given resource type.</summary>
    Task<IReadOnlyList<AbacRule>> GetAbacRulesAsync(string resourceType, CancellationToken cancellationToken = default);
}
