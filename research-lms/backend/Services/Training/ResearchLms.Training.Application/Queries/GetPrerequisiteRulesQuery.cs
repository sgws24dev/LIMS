using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Training.Application.DTOs;
using ResearchLms.Training.Domain.Interfaces;

namespace ResearchLms.Training.Application.Queries;

public record GetPrerequisiteRulesQuery(Guid? InstrumentId) : IRequest<IEnumerable<PrerequisiteRuleDto>>;

public class GetPrerequisiteRulesQueryHandler : IRequestHandler<GetPrerequisiteRulesQuery, IEnumerable<PrerequisiteRuleDto>>
{
    private readonly ICompetencyRepository _dbRepo;
    private readonly ITenantContext _tenantContext;

    public GetPrerequisiteRulesQueryHandler(ICompetencyRepository dbRepo, ITenantContext tenantContext)
    {
        _dbRepo = dbRepo;
        _tenantContext = tenantContext;
    }

    public async Task<IEnumerable<PrerequisiteRuleDto>> Handle(GetPrerequisiteRulesQuery request, CancellationToken ct)
    {
        var rules = await _dbRepo.GetPrerequisiteRulesAsync(_tenantContext.TenantId, request.InstrumentId, ct);
        return rules.Select(r => new PrerequisiteRuleDto(
            r.Id,
            r.InstrumentId,
            r.CompetencyId,
            r.Competency?.Name ?? string.Empty));
    }
}
