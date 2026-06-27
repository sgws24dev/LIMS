using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Commands.Dashboards;

public record CreateDashboardCommand(
    string Name,
    string? Description,
    string Layout,
    bool IsDefault,
    List<CreateDashboardWidgetDto> Widgets
) : IRequest<DashboardDefinitionDto>;

public record CreateDashboardWidgetDto(
    string WidgetType,
    string Config,
    int PositionX,
    int PositionY,
    int Width,
    int Height
);
