namespace ResearchLms.UnitTests.Domain;

using ResearchLms.Shared.Domain.Entities;

public class RefreshTokenTests
{
    [Fact]
    public void Create_WithValidData_IsActive()
    {
        var token = new RefreshToken(Guid.NewGuid(), "token123", DateTime.UtcNow.AddDays(7), "127.0.0.1");
        Assert.True(token.IsActive);
    }

    [Fact]
    public void Revoke_MakesTokenInactive()
    {
        var token = new RefreshToken(Guid.NewGuid(), "token123", DateTime.UtcNow.AddDays(7), "127.0.0.1");
        token.Revoke("127.0.0.1", "replaced-token");
        Assert.False(token.IsActive);
    }

    [Fact]
    public void ExpiredToken_IsNotActive()
    {
        var token = new RefreshToken(Guid.NewGuid(), "token123", DateTime.UtcNow.AddDays(-1), "127.0.0.1");
        Assert.True(token.IsExpired);
        Assert.False(token.IsActive);
    }
}
