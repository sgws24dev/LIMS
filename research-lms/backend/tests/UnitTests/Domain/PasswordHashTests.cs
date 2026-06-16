using System;
using ResearchLms.Identity.Domain.ValueObjects;

namespace ResearchLms.UnitTests.Domain;

public class PasswordHashTests
{
    [Fact]
    public void Create_WithValidPassword_ReturnsHash()
    {
        var hash = PasswordHash.Create("TestPass123!");
        Assert.NotNull(hash);
        Assert.NotEmpty(hash.Hash);
        Assert.StartsWith("$2", hash.Hash);
    }

    [Fact]
    public void Create_WithNullPassword_ThrowsException()
    {
        Assert.Throws<ArgumentNullException>(() => PasswordHash.Create(null!));
    }

    [Fact]
    public void Verify_WithCorrectPassword_ReturnsTrue()
    {
        var hash = PasswordHash.Create("TestPass123!");
        Assert.True(hash.Verify("TestPass123!"));
    }

    [Fact]
    public void Verify_WithWrongPassword_ReturnsFalse()
    {
        var hash = PasswordHash.Create("TestPass123!");
        Assert.False(hash.Verify("WrongPassword!"));
    }

    [Fact]
    public void SamePassword_ProducesDifferentHashes()
    {
        var hash1 = PasswordHash.Create("SamePass123!");
        var hash2 = PasswordHash.Create("SamePass123!");
        Assert.NotEqual(hash1.Hash, hash2.Hash);
    }
}
