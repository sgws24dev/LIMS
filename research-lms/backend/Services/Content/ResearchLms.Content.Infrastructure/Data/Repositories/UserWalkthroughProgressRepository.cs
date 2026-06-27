using Microsoft.EntityFrameworkCore;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Content.Infrastructure.Data;

namespace ResearchLms.Content.Infrastructure.Data.Repositories;

public class UserWalkthroughProgressRepository : IUserWalkthroughProgressRepository
{
    private readonly ContentDbContext _context;

    public UserWalkthroughProgressRepository(ContentDbContext context)
    {
        _context = context;
    }

    public async Task<bool> IsCompletedAsync(Guid tenantId, Guid userId, Guid walkthroughId, CancellationToken ct)
    {
        return await _context.Set<UserWalkthroughProgress>()
            .AnyAsync(p => p.TenantId == tenantId && p.UserId == userId && p.WalkthroughId == walkthroughId
                && (p.Status == WalkthroughProgressStatus.Completed || p.Status == WalkthroughProgressStatus.Skipped), ct);
    }

    public async Task MarkCompletedAsync(Guid tenantId, Guid userId, Guid walkthroughId, CancellationToken ct)
    {
        var progress = await GetOrCreateAsync(tenantId, userId, walkthroughId, ct);
        progress.MarkCompleted();
        await _context.SaveChangesAsync(ct);
    }

    public async Task MarkSkippedAsync(Guid tenantId, Guid userId, Guid walkthroughId, CancellationToken ct)
    {
        var progress = await GetOrCreateAsync(tenantId, userId, walkthroughId, ct);
        progress.MarkSkipped();
        await _context.SaveChangesAsync(ct);
    }

    public async Task SaveProgressAsync(Guid tenantId, Guid userId, Guid walkthroughId, int stepIndex, CancellationToken ct)
    {
        var progress = await GetOrCreateAsync(tenantId, userId, walkthroughId, ct);
        progress.SaveProgress(stepIndex);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<UserWalkthroughProgress?> GetProgressAsync(Guid tenantId, Guid userId, Guid walkthroughId, CancellationToken ct)
    {
        return await _context.Set<UserWalkthroughProgress>()
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.UserId == userId && p.WalkthroughId == walkthroughId, ct);
    }

    public async Task<IReadOnlyList<Guid>> GetCompletedWalkthroughIdsAsync(Guid tenantId, Guid userId, CancellationToken ct)
    {
        return await _context.Set<UserWalkthroughProgress>()
            .Where(p => p.TenantId == tenantId && p.UserId == userId
                && (p.Status == WalkthroughProgressStatus.Completed || p.Status == WalkthroughProgressStatus.Skipped))
            .Select(p => p.WalkthroughId)
            .ToListAsync(ct);
    }

    private async Task<UserWalkthroughProgress> GetOrCreateAsync(Guid tenantId, Guid userId, Guid walkthroughId, CancellationToken ct)
    {
        var existing = await _context.Set<UserWalkthroughProgress>()
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.UserId == userId && p.WalkthroughId == walkthroughId, ct);

        if (existing != null) return existing;

        var progress = new UserWalkthroughProgress(userId, walkthroughId);
        progress.SetTenant(tenantId);
        _context.Set<UserWalkthroughProgress>().Add(progress);
        return progress;
    }
}