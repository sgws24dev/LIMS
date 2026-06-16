namespace ResearchLms.UnitTests.Domain;

using ResearchLms.Shared.Domain.Entities;

public class RoleTests
{
    [Fact]
    public void Create_WithValidData_CreatesRole()
    {
        var role = Role.Create("Admin", "Administrator role");
        Assert.NotNull(role);
        Assert.Equal("Admin", role.Name);
        Assert.False(role.IsSystem);
    }

    [Fact]
    public void Create_NonSystemRole_IsNotSystem()
    {
        var role = Role.Create("Custom Role", "A custom role", isSystem: false);
        Assert.False(role.IsSystem);
    }

    [Fact]
    public void HasPermission_WithViewPermission_ReturnsTrue()
    {
        var role = Role.Create("Viewer", "View-only role");
        role.AddPermission(new Permission("users", canView: true, canCreate: false, canEdit: false, canDelete: false));
        Assert.True(role.HasPermission("users", requireView: true, requireCreate: false, requireEdit: false, requireDelete: false));
    }

    [Fact]
    public void HasPermission_WithoutPermission_ReturnsFalse()
    {
        var role = Role.Create("Viewer", "View-only role");
        role.AddPermission(new Permission("users", canView: true, canCreate: false, canEdit: false, canDelete: false));
        Assert.False(role.HasPermission("users", requireView: false, requireCreate: true, requireEdit: false, requireDelete: false));
    }

    [Fact]
    public void HasPermission_ForDifferentModule_ReturnsFalse()
    {
        var role = Role.Create("Admin", "Admin role");
        role.AddPermission(new Permission("users", canView: true, canCreate: true, canEdit: true, canDelete: true));
        Assert.False(role.HasPermission("instruments", requireView: true, requireCreate: false, requireEdit: false, requireDelete: false));
    }

    [Fact]
    public void AddPermission_AddsToPermissionsList()
    {
        var role = Role.Create("Admin", "Admin role");
        role.AddPermission(new Permission("users", true, true, true, true));
        Assert.Single(role.Permissions);
    }

    [Fact]
    public void RemovePermission_RemovesFromList()
    {
        var role = Role.Create("Admin", "Admin role");
        var perm = new Permission("users", true, true, true, true);
        role.AddPermission(perm);
        role.RemovePermission("users");
        Assert.Empty(role.Permissions);
    }
}
