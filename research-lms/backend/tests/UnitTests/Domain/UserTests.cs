namespace ResearchLms.UnitTests.Domain;

using ResearchLms.Shared.Domain.Entities;

public class UserTests
{
    [Fact]
    public void Create_WithValidData_CreatesUser()
    {
        var user = User.Create("test@test.com", "hash123", "John", "Doe");
        Assert.NotNull(user);
        Assert.Equal("test@test.com", user.Email);
        Assert.True(user.IsActive);
        Assert.NotEqual(Guid.Empty, user.Id);
    }

    [Fact]
    public void Create_WithEmptyEmail_ThrowsException()
    {
        Assert.Throws<ArgumentException>(() => User.Create("", "hash", "John", "Doe"));
    }

    [Fact]
    public void Deactivate_SetsInactive()
    {
        var user = User.Create("test@test.com", "hash", "John", "Doe");
        user.Deactivate();
        Assert.False(user.IsActive);
    }

    [Fact]
    public void RecordLogin_UpdatesLastLogin()
    {
        var user = User.Create("test@test.com", "hash", "John", "Doe");
        var before = user.LastLoginAt;
        user.RecordLogin();
        Assert.NotNull(user.LastLoginAt);
        Assert.NotEqual(before, user.LastLoginAt);
    }

    [Fact]
    public void EnableMfa_SetsMfaEnabled()
    {
        var user = User.Create("test@test.com", "hash", "John", "Doe");
        user.EnableMfa("secret-key");
        Assert.True(user.IsMfaEnabled);
    }
}
