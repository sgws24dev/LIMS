using Microsoft.EntityFrameworkCore;
using ResearchLms.Training.Domain.Entities;
using ResearchLms.Training.Domain.Enums;
using ResearchLms.Training.Domain.Interfaces;
using ResearchLms.Training.Infrastructure.Persistence;

namespace ResearchLms.Training.Infrastructure.Repositories;

public class CompetencyRepository : ICompetencyRepository
{
    private readonly TrainingDbContext _db;

    public CompetencyRepository(TrainingDbContext db)
    {
        _db = db;
    }

    public async Task<Competency?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Competencies.FindAsync([id], ct);
    }

    public async Task<IEnumerable<Competency>> GetAllAsync(Guid tenantId, CompetencyCategory? category, CancellationToken ct)
    {
        var query = _db.Competencies
            .Where(e => e.TenantId == tenantId)
            .AsQueryable();

        if (category.HasValue)
            query = query.Where(e => e.Category == category.Value);

        return await query
            .OrderBy(e => e.Name)
            .ToListAsync(ct);
    }

    public async Task<Competency> AddAsync(Competency competency, CancellationToken ct)
    {
        _db.Competencies.Add(competency);
        await _db.SaveChangesAsync(ct);
        return competency;
    }

    public async Task UpdateAsync(Competency competency, CancellationToken ct)
    {
        _db.Competencies.Update(competency);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Competency competency, CancellationToken ct)
    {
        competency.MarkDeleted("system");
        _db.Competencies.Update(competency);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<UserCompetency>> GetUserCompetenciesAsync(
        Guid tenantId, Guid? userId, Guid? competencyId, CompetencyStatus? status, CancellationToken ct)
    {
        var query = _db.UserCompetencies
            .Include(uc => uc.Competency)
            .Where(uc => uc.TenantId == tenantId)
            .AsQueryable();

        if (userId.HasValue)
            query = query.Where(uc => uc.UserId == userId.Value);
        if (competencyId.HasValue)
            query = query.Where(uc => uc.CompetencyId == competencyId.Value);
        if (status.HasValue)
            query = query.Where(uc => uc.Status == status.Value);

        return await query
            .OrderByDescending(uc => uc.AchievedAt)
            .ToListAsync(ct);
    }

    public async Task<UserCompetency?> GetUserCompetencyByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.UserCompetencies
            .Include(uc => uc.Competency)
            .FirstOrDefaultAsync(uc => uc.Id == id, ct);
    }

    public async Task<UserCompetency> AddUserCompetencyAsync(UserCompetency uc, CancellationToken ct)
    {
        _db.UserCompetencies.Add(uc);
        await _db.SaveChangesAsync(ct);
        return uc;
    }

    public async Task UpdateUserCompetencyAsync(UserCompetency uc, CancellationToken ct)
    {
        _db.UserCompetencies.Update(uc);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<PrerequisiteRule>> GetPrerequisiteRulesAsync(
        Guid tenantId, Guid? instrumentId, CancellationToken ct)
    {
        var query = _db.PrerequisiteRules
            .Include(r => r.Competency)
            .Where(r => r.TenantId == tenantId)
            .AsQueryable();

        if (instrumentId.HasValue)
            query = query.Where(r => r.InstrumentId == instrumentId.Value);

        return await query
            .OrderBy(r => r.Competency!.Name)
            .ToListAsync(ct);
    }

    public async Task<PrerequisiteRule?> GetPrerequisiteRuleByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.PrerequisiteRules
            .Include(r => r.Competency)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    public async Task<PrerequisiteRule> AddPrerequisiteRuleAsync(PrerequisiteRule rule, CancellationToken ct)
    {
        _db.PrerequisiteRules.Add(rule);
        await _db.SaveChangesAsync(ct);
        return rule;
    }

    public async Task UpdatePrerequisiteRuleAsync(PrerequisiteRule rule, CancellationToken ct)
    {
        _db.PrerequisiteRules.Update(rule);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeletePrerequisiteRuleAsync(PrerequisiteRule rule, CancellationToken ct)
    {
        _db.PrerequisiteRules.Remove(rule);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<UserCompetency>> GetExpiringUserCompetenciesAsync(int withinDays, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var expiryThreshold = now.AddDays(withinDays);

        return await _db.UserCompetencies
            .Include(uc => uc.Competency)
            .Where(uc => uc.Status == CompetencyStatus.Active
                         && uc.ExpiresAt <= expiryThreshold
                         && uc.ExpiresAt > now)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<UserCompetency>> GetExpiredUserCompetenciesAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;

        return await _db.UserCompetencies
            .Include(uc => uc.Competency)
            .Where(uc => uc.Status == CompetencyStatus.Active
                         && uc.ExpiresAt <= now)
            .ToListAsync(ct);
    }
}
