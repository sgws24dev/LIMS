using MediatR;
using ResearchLms.Billing.Application.Commands.Dashboards;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Dashboards;

public record GetDashboardByIdQuery(Guid Id) : IRequest<DashboardDefinitionDto>;

public class GetDashboardByIdQueryHandler : IRequestHandler<GetDashboardByIdQuery, DashboardDefinitionDto>
{
    private readonly IDashboardRepository _repository;

    public GetDashboardByIdQueryHandler(IDashboardRepository repository)
    {
        _repository = repository;
    }

    public async Task<DashboardDefinitionDto> Handle(GetDashboardByIdQuery request, CancellationToken ct)
    {
        var dashboard = await _repository.GetByIdAsync(request.Id, ct);
        if (dashboard == null)
            throw new KeyNotFoundException($"Dashboard {request.Id} not found");

        return CreateDashboardCommandHandler.MapToDto(dashboard);
    }
}
