namespace ResearchLms.UnitTests.Domain;

using ResearchLms.Shared.Domain.Entities;

public class TenantTests
{
    [Fact]
    public void Create_WithValidData_CreatesTenant()
    {
        var tenant = Tenant.Create("Test Institution", "TEST", "test.edu", "admin@test.edu");
        Assert.NotNull(tenant);
        Assert.Equal("test", tenant.Code);
        Assert.True(tenant.IsActive);
    }

    [Fact]
    public void Suspend_DeactivatesTenant()
    {
        var tenant = Tenant.Create("Test", "TEST", "test.edu", "admin@test.edu");
        tenant.Suspend();
        Assert.False(tenant.IsActive);
    }

    [Fact]
    public void Create_WithEmptyName_ThrowsException()
    {
        Assert.Throws<ArgumentException>(() => Tenant.Create("", "TEST", "test.edu", "admin@test.edu"));
    }
}
