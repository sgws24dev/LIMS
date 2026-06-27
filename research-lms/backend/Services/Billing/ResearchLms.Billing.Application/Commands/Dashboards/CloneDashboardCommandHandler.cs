using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Commands.Dashboards;

public class CloneDashboardCommandHandler : IRequestHandler<CloneDashboardCommand, DashboardDefinitionDto>
{
    private readonly IDashboardRepository _repository;
    private readonly ITenantContext _tenantContext;

    public CloneDashboardCommandHandler(IDashboardRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<DashboardDefinitionDto> Handle(CloneDashboardCommand request, CancellationToken ct)
    {
        var source = await _repository.GetByIdAsync(request.Id, ct);
        if (source == null)
            throw new KeyNotFoundException($"Dashboard {request.Id} not found");

        var userName = "system";
        var clone = new DashboardDefinition(
            request.Name,
            source.Description,
            source.Layout,
            false,
            _tenantContext.TenantId,
            userName);

        foreach (var w in source.Widgets)
        {
            var widgetClone = new DashboardWidget(
                clone.Id,
                w.WidgetType,
                w.Config,
                w.PositionX,
                w.PositionY,
                w.Width,
                w.Height,
                userName);
            clone.AddWidget(widgetClone);
        }

        await _repository.AddAsync(clone, ct);

        return CreateDashboardCommandHandler.MapToDto(clone);
    }
}
