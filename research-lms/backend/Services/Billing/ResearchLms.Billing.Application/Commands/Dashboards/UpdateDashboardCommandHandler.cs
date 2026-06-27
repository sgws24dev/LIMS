using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Commands.Dashboards;

public class UpdateDashboardCommandHandler : IRequestHandler<UpdateDashboardCommand, DashboardDefinitionDto>
{
    private readonly IDashboardRepository _repository;
    private readonly ITenantContext _tenantContext;

    public UpdateDashboardCommandHandler(IDashboardRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<DashboardDefinitionDto> Handle(UpdateDashboardCommand request, CancellationToken ct)
    {
        var dashboard = await _repository.GetByIdAsync(request.Id, ct);
        if (dashboard == null)
            throw new KeyNotFoundException($"Dashboard {request.Id} not found");

        dashboard.UpdateDetails(request.Name, request.Description, request.Layout, request.IsDefault, "system");

        await _repository.UpdateAsync(dashboard, ct);

        return CreateDashboardCommandHandler.MapToDto(dashboard);
    }
}
