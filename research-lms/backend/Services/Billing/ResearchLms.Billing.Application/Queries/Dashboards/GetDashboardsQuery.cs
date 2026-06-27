using MediatR;
using ResearchLms.Billing.Application.Commands.Dashboards;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Queries.Dashboards;

public record GetDashboardsQuery : IRequest<IReadOnlyList<DashboardDefinitionDto>>;

public class GetDashboardsQueryHandler : IRequestHandler<GetDashboardsQuery, IReadOnlyList<DashboardDefinitionDto>>
{
    private readonly IDashboardRepository _repository;
    private readonly ITenantContext _tenantContext;

    public GetDashboardsQueryHandler(IDashboardRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<DashboardDefinitionDto>> Handle(GetDashboardsQuery request, CancellationToken ct)
    {
        var dashboards = await _repository.GetAllAsync(_tenantContext.TenantId, ct);
        return dashboards.Select(CreateDashboardCommandHandler.MapToDto).ToList();
    }
}
