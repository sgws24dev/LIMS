using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Training.Application.DTOs;
using ResearchLms.Training.Domain.Enums;
using ResearchLms.Training.Domain.Interfaces;

namespace ResearchLms.Training.Application.Queries;

public record GetUserCompetenciesQuery(
    Guid? UserId,
    Guid? CompetencyId,
    CompetencyStatus? Status
) : IRequest<IEnumerable<UserCompetencyDto>>;

public class GetUserCompetenciesQueryHandler : IRequestHandler<GetUserCompetenciesQuery, IEnumerable<UserCompetencyDto>>
{
    private readonly ICompetencyRepository _dbRepo;
    private readonly ITenantContext _tenantContext;

    public GetUserCompetenciesQueryHandler(ICompetencyRepository dbRepo, ITenantContext tenantContext)
    {
        _dbRepo = dbRepo;
        _tenantContext = tenantContext;
    }

    public async Task<IEnumerable<UserCompetencyDto>> Handle(GetUserCompetenciesQuery request, CancellationToken ct)
    {
        var items = await _dbRepo.GetUserCompetenciesAsync(
            _tenantContext.TenantId, request.UserId, request.CompetencyId, request.Status, ct);

        return items.Select(uc => new UserCompetencyDto(
            uc.Id,
            uc.UserId,
            uc.CompetencyId,
            uc.Competency?.Name ?? string.Empty,
            uc.AchievedAt,
            uc.ExpiresAt,
            uc.Status,
            uc.RenewedAt));
    }
}
