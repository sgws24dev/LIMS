namespace ResearchLms.Identity.Domain.Interfaces;

using ResearchLms.Shared.Domain.Entities;

/// <summary>Repository abstraction for <see cref="User"/> persistence.</summary>
public interface IUserRepository
{
    /// <summary>Gets a user by its unique identifier.</summary>
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Gets a user by their email address.</summary>
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>Gets a paginated, filtered list of users.</summary>
    Task<(IReadOnlyList<User> Items, int TotalCount)> GetAllAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    /// <summary>Adds a new user.</summary>
    Task AddAsync(User user, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing user.</summary>
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);

    /// <summary>Deletes (soft) a user by its identifier.</summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Checks whether a user with the given email already exists.</summary>
    Task<bool> ExistsAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>Gets the total count of users, optionally filtered.</summary>
    Task<int> GetCountAsync(bool? isActive = null, CancellationToken cancellationToken = default);

    /// <summary>Gets a user by a refresh token value.</summary>
    Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);

    /// <summary>Gets a user by their password reset token.</summary>
    Task<User?> GetByPasswordResetTokenAsync(string token, CancellationToken cancellationToken = default);

    /// <summary>Searches users by a query string (matches name or email).</summary>
    Task<IReadOnlyList<User>> SearchAsync(string query, int limit = 10, CancellationToken cancellationToken = default);
}
