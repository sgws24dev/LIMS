using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Identity.Domain.ValueObjects;

public sealed class PasswordHash : ValueObject
{
    private PasswordHash(string hash)
    {
        Hash = hash;
    }

    public string Hash { get; }

    public static PasswordHash Create(string plainTextPassword)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(plainTextPassword);
        var hash = BCrypt.Net.BCrypt.HashPassword(plainTextPassword, workFactor: 10);
        return new PasswordHash(hash);
    }

    public bool Verify(string plainTextPassword)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(plainTextPassword);
        return BCrypt.Net.BCrypt.Verify(plainTextPassword, Hash);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Hash;
    }

    public override string ToString() => Hash;
}
