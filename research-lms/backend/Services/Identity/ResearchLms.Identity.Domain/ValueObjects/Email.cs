namespace ResearchLms.Identity.Domain.ValueObjects;

using System.Text.RegularExpressions;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Exceptions;

/// <summary>Value object representing a validated email address.</summary>
public sealed partial class Email : ValueObject
{
    private static readonly Regex EmailRegex = CreateEmailRegex();

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase | RegexOptions.Compiled, 250)]
    private static partial Regex CreateEmailRegex();

    private Email(string value)
    {
        Value = value;
    }

    /// <summary>Gets the underlying email string.</summary>
    public string Value { get; }

    /// <summary>Performs an implicit conversion from <see cref="string"/> to <see cref="Email"/>.</summary>
    public static implicit operator Email(string email) => Create(email);

    /// <summary>Performs an implicit conversion from <see cref="Email"/> to <see cref="string"/>.</summary>
    public static implicit operator string(Email email) => email.Value;

    /// <summary>Creates an <see cref="Email"/> after validating the format.</summary>
    public static Email Create(string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        var trimmed = email.Trim().ToLowerInvariant();

        if (!EmailRegex.IsMatch(trimmed))
            throw new ValidationException($"'{email}' is not a valid email address.");

        return new Email(trimmed);
    }

    /// <inheritdoc />
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    /// <inheritdoc />
    public override string ToString() => Value;
}
