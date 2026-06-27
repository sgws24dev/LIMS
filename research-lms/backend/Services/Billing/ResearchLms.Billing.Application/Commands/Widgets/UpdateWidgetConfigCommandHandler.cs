using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Commands.Widgets;

public class UpdateWidgetConfigCommandHandler : IRequestHandler<UpdateWidgetConfigCommand, DashboardWidgetDto>
{
    private readonly IDashboardRepository _repository;

    public UpdateWidgetConfigCommandHandler(IDashboardRepository repository)
    {
        _repository = repository;
    }

    public async Task<DashboardWidgetDto> Handle(UpdateWidgetConfigCommand request, CancellationToken ct)
    {
        var dashboard = await _repository.GetByIdAsync(request.DashboardId, ct);
        if (dashboard == null)
            throw new KeyNotFoundException($"Dashboard {request.DashboardId} not found");

        var widget = dashboard.Widgets.FirstOrDefault(w => w.Id == request.WidgetId);
        if (widget == null)
            throw new KeyNotFoundException($"Widget {request.WidgetId} not found");

        widget.UpdateConfig(request.Config, "system");
        widget.UpdatePosition(request.PositionX, request.PositionY, request.Width, request.Height, "system");

        await _repository.UpdateAsync(dashboard, ct);

        return new DashboardWidgetDto
        {
            Id = widget.Id,
            DashboardId = widget.DashboardId,
            WidgetType = widget.WidgetType.ToString(),
            Config = widget.Config,
            PositionX = widget.PositionX,
            PositionY = widget.PositionY,
            Width = widget.Width,
            Height = widget.Height,
            IsVisible = widget.IsVisible,
            CreatedAt = widget.CreatedAt,
        };
    }
}
