namespace ResearchLms.Identity.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Identity.Domain.Interfaces;
using ResearchLms.Shared.Domain.Entities;

public class UserRepository : IUserRepository
{
    private readonly ResearchLmsDbContext _context;

    public UserRepository(ResearchLmsDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted, cancellationToken);
    }

    public async Task<(IReadOnlyList<User> Items, int TotalCount)> GetAllAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users.Where(u => !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u => u.Email.Contains(term) || u.FirstName.Contains(term) || u.LastName.Contains(term));
        }

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
    }

    public Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Update(user);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { id }, cancellationToken);
        if (user is not null)
            _context.Users.Remove(user);
    }

    public async Task<bool> ExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users.AnyAsync(u => u.Email == email && !u.IsDeleted, cancellationToken);
    }

    public async Task<int> GetCountAsync(bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Users.Where(u => !u.IsDeleted);

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var rt = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken && !rt.IsDeleted && rt.IsActive, cancellationToken);

        if (rt is null)
            return null;

        return await GetByIdAsync(rt.UserId, cancellationToken);
    }

    public async Task<User?> GetByPasswordResetTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u =>
                u.PasswordResetToken == token &&
                u.PasswordResetTokenExpiry > DateTime.UtcNow &&
                !u.IsDeleted, cancellationToken);
    }

    public async Task<IReadOnlyList<User>> SearchAsync(string query, int limit = 10, CancellationToken cancellationToken = default)
    {
        var term = query.Trim().ToLower();
        return await _context.Users
            .Where(u => !u.IsDeleted && (u.Email.Contains(term) || u.FirstName.Contains(term) || u.LastName.Contains(term)))
            .OrderBy(u => u.Email)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }
}
