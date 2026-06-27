using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Training.Application.DTOs;
using ResearchLms.Training.Domain.Enums;
using ResearchLms.Training.Domain.Interfaces;

namespace ResearchLms.Training.Application.Queries;

public record GetCompetenciesQuery(CompetencyCategory? Category) : IRequest<IEnumerable<CompetencyDto>>;

public class GetCompetenciesQueryHandler : IRequestHandler<GetCompetenciesQuery, IEnumerable<CompetencyDto>>
{
    private readonly ICompetencyRepository _dbRepo;
    private readonly ITenantContext _tenantContext;

    public GetCompetenciesQueryHandler(ICompetencyRepository dbRepo, ITenantContext tenantContext)
    {
        _dbRepo = dbRepo;
        _tenantContext = tenantContext;
    }

    public async Task<IEnumerable<CompetencyDto>> Handle(GetCompetenciesQuery request, CancellationToken ct)
    {
        var competencies = await _dbRepo.GetAllAsync(_tenantContext.TenantId, request.Category, ct);
        return competencies.Select(c => new CompetencyDto(
            c.Id,
            c.Name,
            c.Description,
            c.Category,
            c.ValidityPeriodDays,
            c.RequiresRenewal,
            c.CreatedAt));
    }
}
