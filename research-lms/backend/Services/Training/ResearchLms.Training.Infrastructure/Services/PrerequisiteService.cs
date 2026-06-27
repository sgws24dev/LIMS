using ResearchLms.Shared.Abstractions;
using ResearchLms.Training.Domain.Enums;
using ResearchLms.Training.Domain.Interfaces;
using ResearchLms.Training.Domain.ValueObjects;

namespace ResearchLms.Training.Infrastructure.Services;

public class PrerequisiteService : IPrerequisiteService
{
    private readonly ICompetencyRepository _repository;
    private readonly ITenantContext _tenantContext;

    public PrerequisiteService(ICompetencyRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<PrerequisiteResult> ValidateAsync(Guid userId, Guid? instrumentId, CancellationToken ct)
    {
        var unmet = new List<PrerequisiteResult.UnmetPrerequisite>();

        if (instrumentId is null)
            return new PrerequisiteResult(true, unmet);

        var tenantId = _tenantContext.TenantId;
        var rules = await _repository.GetPrerequisiteRulesAsync(tenantId, instrumentId, ct);
        var rulesList = rules.ToList();

        if (rulesList.Count == 0)
            return new PrerequisiteResult(true, unmet);

        var userCompetencies = await _repository.GetUserCompetenciesAsync(
            tenantId, userId, null, CompetencyStatus.Active, ct);

        var activeCompetencyIds = userCompetencies
            .Select(uc => uc.CompetencyId)
            .ToHashSet();

        foreach (var rule in rulesList)
        {
            if (!activeCompetencyIds.Contains(rule.CompetencyId))
            {
                var competencyName = rule.Competency?.Name ?? "Unknown";
                var userComp = userCompetencies
                    .FirstOrDefault(uc => uc.CompetencyId == rule.CompetencyId);

                unmet.Add(new PrerequisiteResult.UnmetPrerequisite(
                    competencyName,
                    userComp?.ExpiresAt,
                    $"Complete the '{competencyName}' competency"));
            }
        }

        return new PrerequisiteResult(unmet.Count == 0, unmet);
    }
}
