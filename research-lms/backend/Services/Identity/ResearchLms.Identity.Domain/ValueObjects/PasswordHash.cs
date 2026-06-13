namespace ResearchLms.Identity.Domain.ValueObjects;

using System.Security.Cryptography;
using System.Text;
using ResearchLms.Shared.Abstractions;

/// <summary>Value object representing a hashed password.</summary>
/// <remarks>
/// TODO: Replace the placeholder hashing below with BCrypt.Net or ASP.NET Core Identity's PasswordHasher
/// for production use. The current implementation uses SHA-256 as a stand-in.
/// </remarks>
public sealed class PasswordHash : ValueObject
{
    private PasswordHash(string hash)
    {
        Hash = hash;
    }

    /// <summary>Gets the hashed password string.</summary>
    public string Hash { get; }

    /// <summary>
    /// Creates a <see cref="PasswordHash"/> from a plain-text password.
    /// </summary>
    /// <param name="plainTextPassword">The plain-text password to hash.</param>
    /// <returns>A new <see cref="PasswordHash"/> instance.</returns>
    public static PasswordHash Create(string plainTextPassword)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(plainTextPassword);

        // TODO: Replace with BCrypt.Net.BCrypt.HashPassword(plainTextPassword)
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(plainTextPassword)));
        return new PasswordHash(hash);
    }

    /// <summary>
    /// Verifies a plain-text password against the stored hash.
    /// </summary>
    /// <param name="plainTextPassword">The plain-text password to verify.</param>
    /// <returns><c>true</c> if the password matches; otherwise, <c>false</c>.</returns>
    public bool Verify(string plainTextPassword)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(plainTextPassword);

        // TODO: Replace with BCrypt.Net.BCrypt.Verify(plainTextPassword, Hash)
        var computed = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(plainTextPassword)));
        return string.Equals(Hash, computed, StringComparison.OrdinalIgnoreCase);
    }

    /// <inheritdoc />
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Hash;
    }

    /// <inheritdoc />
    public override string ToString() => Hash;
}
