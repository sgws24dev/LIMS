using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Events;
using ResearchLms.Shared.Exceptions;

namespace ResearchLms.Shared.Domain.Entities;

public sealed class Role : BaseEntity
{
    private readonly List<Permission> _permissions = new();

    private Role() { }

    private Role(string name, string? description, bool isSystem)
    {
        Name = name;
        Description = description;
        IsSystem = isSystem;
    }

    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsSystem { get; private set; }
    public IReadOnlyCollection<Permission> Permissions => _permissions.AsReadOnly();

    public static Role Create(string name, string? description, bool isSystem = false)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        var role = new Role(name.Trim(), description?.Trim(), isSystem);
        role.AddDomainEvent(new RoleCreatedEvent(role.Id, role.Name, role._permissions.Select(p => new PermissionDto(p.Module, p.CanView, p.CanCreate, p.CanEdit, p.CanDelete)).ToList()));
        return role;
    }

    public void AddPermission(Permission permission)
    {
        ArgumentNullException.ThrowIfNull(permission);

        if (_permissions.Any(p => p.Module == permission.Module))
            throw new DomainException("PERMISSION_EXISTS", $"A permission for module '{permission.Module}' already exists on role '{Name}'.");

        _permissions.Add(permission);
        MarkUpdated(nameof(Role));
    }

    public void RemovePermission(string module)
    {
        var permission = _permissions.FirstOrDefault(p => p.Module == module)
            ?? throw new DomainException("PERMISSION_NOT_FOUND", $"Permission for module '{module}' was not found on role '{Name}'.");

        _permissions.Remove(permission);
        MarkUpdated(nameof(Role));
    }

    public void UpdateDetails(string name, string? description)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Name = name.Trim();
        Description = description?.Trim();
        MarkUpdated(nameof(Role));
        AddDomainEvent(new RoleUpdatedEvent(Id, Name, _permissions.Select(p => new PermissionDto(p.Module, p.CanView, p.CanCreate, p.CanEdit, p.CanDelete)).ToList()));
    }

    public bool HasPermission(string module, bool requireView = false, bool requireCreate = false, bool requireEdit = false, bool requireDelete = false)
    {
        var permission = _permissions.FirstOrDefault(p => p.Module == module);
        if (permission is null)
            return false;

        if (requireView && !permission.CanView) return false;
        if (requireCreate && !permission.CanCreate) return false;
        if (requireEdit && !permission.CanEdit) return false;
        if (requireDelete && !permission.CanDelete) return false;

        return true;
    }
}
