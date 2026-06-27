using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ResearchLms.Training.Domain.Entities;
using ResearchLms.Training.Domain.Enums;
using ResearchLms.Training.Domain.Interfaces;
using ResearchLms.Training.Infrastructure.Persistence;

namespace ResearchLms.Training.Infrastructure.BackgroundJobs;

public class CompetencyExpiryJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<CompetencyExpiryJob> _logger;

    public CompetencyExpiryJob(IServiceScopeFactory scopeFactory, ILogger<CompetencyExpiryJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("CompetencyExpiryJob started at {Time}", DateTime.UtcNow);

        using var scope = _scopeFactory.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ICompetencyRepository>();
        var db = scope.ServiceProvider.GetRequiredService<TrainingDbContext>();

        var expiring = await repo.GetExpiringUserCompetenciesAsync(30, ct);
        foreach (var uc in expiring)
        {
            _logger.LogWarning(
                "UserCompetency {Id} for Competency {CompetencyId} of User {UserId} expires at {ExpiresAt}",
                uc.Id, uc.CompetencyId, uc.UserId, uc.ExpiresAt);
        }

        var expired = await repo.GetExpiredUserCompetenciesAsync(ct);
        foreach (var uc in expired)
        {
            _logger.LogInformation(
                "Marking UserCompetency {Id} for Competency {CompetencyId} of User {UserId} as Expired",
                uc.Id, uc.CompetencyId, uc.UserId);

            var entry = db.Entry(uc);
            entry.Property(nameof(UserCompetency.Status)).CurrentValue = CompetencyStatus.Expired;
        }

        await db.SaveChangesAsync(ct);

        _logger.LogInformation(
            "CompetencyExpiryJob completed. Expiring: {ExpiringCount}, Expired: {ExpiredCount}",
            expiring.Count(), expired.Count());
    }
}
