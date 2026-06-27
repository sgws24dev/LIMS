using ResearchLms.Training.Domain.Entities;
using ResearchLms.Training.Domain.Enums;

namespace ResearchLms.Training.Domain.Interfaces;

public interface ICompetencyRepository
{
    Task<Competency?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<Competency>> GetAllAsync(Guid tenantId, CompetencyCategory? category, CancellationToken ct);
    Task<Competency> AddAsync(Competency competency, CancellationToken ct);
    Task UpdateAsync(Competency competency, CancellationToken ct);
    Task DeleteAsync(Competency competency, CancellationToken ct);
    Task<IEnumerable<UserCompetency>> GetUserCompetenciesAsync(Guid tenantId, Guid? userId, Guid? competencyId, CompetencyStatus? status, CancellationToken ct);
    Task<UserCompetency?> GetUserCompetencyByIdAsync(Guid id, CancellationToken ct);
    Task<UserCompetency> AddUserCompetencyAsync(UserCompetency uc, CancellationToken ct);
    Task UpdateUserCompetencyAsync(UserCompetency uc, CancellationToken ct);
    Task<IEnumerable<PrerequisiteRule>> GetPrerequisiteRulesAsync(Guid tenantId, Guid? instrumentId, CancellationToken ct);
    Task<PrerequisiteRule?> GetPrerequisiteRuleByIdAsync(Guid id, CancellationToken ct);
    Task<PrerequisiteRule> AddPrerequisiteRuleAsync(PrerequisiteRule rule, CancellationToken ct);
    Task UpdatePrerequisiteRuleAsync(PrerequisiteRule rule, CancellationToken ct);
    Task DeletePrerequisiteRuleAsync(PrerequisiteRule rule, CancellationToken ct);
    Task<IEnumerable<UserCompetency>> GetExpiringUserCompetenciesAsync(int withinDays, CancellationToken ct);
    Task<IEnumerable<UserCompetency>> GetExpiredUserCompetenciesAsync(CancellationToken ct);
}
