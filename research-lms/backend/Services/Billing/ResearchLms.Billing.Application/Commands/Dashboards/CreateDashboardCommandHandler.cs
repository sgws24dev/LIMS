using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Application.Commands.Dashboards;

public class CreateDashboardCommandHandler : IRequestHandler<CreateDashboardCommand, DashboardDefinitionDto>
{
    private readonly IDashboardRepository _repository;
    private readonly ITenantContext _tenantContext;

    public CreateDashboardCommandHandler(IDashboardRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<DashboardDefinitionDto> Handle(CreateDashboardCommand request, CancellationToken ct)
    {
        var userId = _tenantContext.TenantId;
        var userName = "system";

        var dashboard = new DashboardDefinition(
            request.Name,
            request.Description,
            request.Layout,
            request.IsDefault,
            userId,
            userName);

        foreach (var w in request.Widgets)
        {
            var widget = new DashboardWidget(
                dashboard.Id,
                Enum.Parse<WidgetType>(w.WidgetType),
                w.Config,
                w.PositionX,
                w.PositionY,
                w.Width,
                w.Height,
                userName);
            dashboard.AddWidget(widget);
        }

        await _repository.AddAsync(dashboard, ct);

        return MapToDto(dashboard);
    }

    internal static DashboardDefinitionDto MapToDto(DashboardDefinition dashboard)
    {
        return new DashboardDefinitionDto
        {
            Id = dashboard.Id,
            Name = dashboard.Name,
            Description = dashboard.Description,
            Layout = dashboard.Layout,
            IsDefault = dashboard.IsDefault,
            IsShared = dashboard.IsShared,
            SharedWith = dashboard.SharedWith,
            CreatedByUserId = dashboard.CreatedByUserId,
            CreatedAt = dashboard.CreatedAt,
            UpdatedAt = dashboard.UpdatedAt,
            Widgets = dashboard.Widgets.Select(w => new DashboardWidgetDto
            {
                Id = w.Id,
                DashboardId = w.DashboardId,
                WidgetType = w.WidgetType.ToString(),
                Config = w.Config,
                PositionX = w.PositionX,
                PositionY = w.PositionY,
                Width = w.Width,
                Height = w.Height,
                IsVisible = w.IsVisible,
                CreatedAt = w.CreatedAt,
            }).ToList(),
        };
    }
}
