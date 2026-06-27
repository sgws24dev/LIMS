using MediatR;
using ResearchLms.Billing.Application.DTOs;

namespace ResearchLms.Billing.Application.Commands.Widgets;

public record UpdateWidgetConfigCommand(
    Guid DashboardId,
    Guid WidgetId,
    string Config,
    int PositionX,
    int PositionY,
    int Width,
    int Height
) : IRequest<DashboardWidgetDto>;
