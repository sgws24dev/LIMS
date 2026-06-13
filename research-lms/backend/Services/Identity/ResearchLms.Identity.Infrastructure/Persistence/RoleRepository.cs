namespace ResearchLms.Identity.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Identity.Domain.Interfaces;
using ResearchLms.Shared.Domain.Entities;

public class RoleRepository : IRoleRepository
{
    private readonly ResearchLmsDbContext _context;

    public RoleRepository(ResearchLmsDbContext context)
    {
        _context = context;
    }

    public async Task<Role?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted, cancellationToken);
    }

    public async Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Name == name && !r.IsDeleted, cancellationToken);
    }

    public async Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .Include(r => r.Permissions)
            .Where(r => !r.IsDeleted)
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Role role, CancellationToken cancellationToken = default)
    {
        await _context.Roles.AddAsync(role, cancellationToken);
    }

    public Task UpdateAsync(Role role, CancellationToken cancellationToken = default)
    {
        _context.Roles.Update(role);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var role = await _context.Roles.FindAsync(new object[] { id }, cancellationToken);
        if (role is not null)
            _context.Roles.Remove(role);
    }

    public async Task<IReadOnlyList<Role>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var roleIds = await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.RoleId)
            .ToListAsync(cancellationToken);

        return await _context.Roles
            .Include(r => r.Permissions)
            .Where(r => roleIds.Contains(r.Id) && !r.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Permission>> GetRolePermissionsAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        var role = await _context.Roles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == roleId && !r.IsDeleted, cancellationToken);

        return role?.Permissions.ToList() ?? new List<Permission>();
    }

    public async Task<IReadOnlyList<AbacRule>> GetAbacRulesAsync(string resourceType, CancellationToken cancellationToken = default)
    {
        return await _context.AbacRules
            .Where(r => r.ResourceType == resourceType && r.IsEnabled && !r.IsDeleted)
            .OrderByDescending(r => r.Priority)
            .ToListAsync(cancellationToken);
    }
}
