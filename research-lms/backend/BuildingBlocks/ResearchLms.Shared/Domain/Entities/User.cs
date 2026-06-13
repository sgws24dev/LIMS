using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Events;
using ResearchLms.Shared.Exceptions;

namespace ResearchLms.Shared.Domain.Entities;

public sealed class User : BaseEntity
{
    private readonly List<RefreshToken> _refreshTokens = new();
    private string _passwordHash = string.Empty;

    private User() { }

    private User(string email, string passwordHash, string firstName, string lastName)
    {
        Email = email;
        _passwordHash = passwordHash;
        FirstName = firstName;
        LastName = lastName;
        IsActive = true;
    }

    public string Email { get; private set; } = string.Empty;
    public string PasswordHash => _passwordHash;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string? AvatarUrl { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsMfaEnabled { get; private set; }
    public string? MfaSecret { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

    public static User Create(string email, string passwordHash, string firstName, string lastName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(firstName);
        ArgumentException.ThrowIfNullOrWhiteSpace(lastName);

        var user = new User(email.Trim().ToLowerInvariant(), passwordHash, firstName.Trim(), lastName.Trim());
        user.AddDomainEvent(new UserCreatedEvent(user.Id, user.Email, $"{user.FirstName} {user.LastName}", Array.Empty<string>()));
        return user;
    }

    public void UpdateProfile(string firstName, string lastName, string? phone, string? avatarUrl)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(firstName);
        ArgumentException.ThrowIfNullOrWhiteSpace(lastName);

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Phone = phone?.Trim();
        AvatarUrl = avatarUrl?.Trim();

        MarkUpdated(nameof(User));
        AddDomainEvent(new UserUpdatedEvent(Id, Email, $"{FirstName} {LastName}", Array.Empty<string>()));
    }

    public void ChangePassword(string newPasswordHash)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(newPasswordHash);

        _passwordHash = newPasswordHash;
        MarkUpdated(nameof(User));
    }

    public bool VerifyPassword(string plainTextPassword, Func<string, string, bool> hashVerifier)
    {
        ArgumentNullException.ThrowIfNull(hashVerifier);
        return hashVerifier(plainTextPassword, _passwordHash);
    }

    public void EnableMfa(string secret)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(secret);

        IsMfaEnabled = true;
        MfaSecret = secret;
        MarkUpdated(nameof(User));
    }

    public void DisableMfa()
    {
        IsMfaEnabled = false;
        MfaSecret = null;
        MarkUpdated(nameof(User));
    }

    public void AddRefreshToken(RefreshToken refreshToken)
    {
        ArgumentNullException.ThrowIfNull(refreshToken);
        _refreshTokens.Add(refreshToken);
        MarkUpdated(nameof(User));
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
        MarkUpdated(nameof(User));
    }

    public void SetPasswordResetToken(string token, DateTime expiry)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(token);
        PasswordResetToken = token;
        PasswordResetTokenExpiry = expiry;
        MarkUpdated(nameof(User));
    }

    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
        MarkUpdated(nameof(User));
    }

    public void Deactivate()
    {
        if (!IsActive)
            throw new DomainException("USER_ALREADY_INACTIVE", "User account is already deactivated.");

        IsActive = false;
        MarkUpdated(nameof(User));
        AddDomainEvent(new UserDeletedEvent(Id, Email));
    }
}
