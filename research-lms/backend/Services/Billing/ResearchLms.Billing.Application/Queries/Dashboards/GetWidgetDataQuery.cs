using MediatR;
using ResearchLms.Billing.Application.DTOs;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Application.Queries.Dashboards;

public record GetWidgetDataQuery(
    Guid DashboardId,
    Guid WidgetId,
    DateTime From,
    DateTime To
) : IRequest<WidgetDataDto>;

public class GetWidgetDataQueryHandler : IRequestHandler<GetWidgetDataQuery, WidgetDataDto>
{
    private readonly IDashboardRepository _dashboardRepository;
    private readonly IWidgetDataSourceResolver _dataSourceResolver;

    public GetWidgetDataQueryHandler(
        IDashboardRepository dashboardRepository,
        IWidgetDataSourceResolver dataSourceResolver)
    {
        _dashboardRepository = dashboardRepository;
        _dataSourceResolver = dataSourceResolver;
    }

    public async Task<WidgetDataDto> Handle(GetWidgetDataQuery request, CancellationToken ct)
    {
        var dashboard = await _dashboardRepository.GetByIdAsync(request.DashboardId, ct);
        if (dashboard == null)
            throw new KeyNotFoundException($"Dashboard {request.DashboardId} not found");

        var widget = dashboard.Widgets.FirstOrDefault(w => w.Id == request.WidgetId);
        if (widget == null)
            throw new KeyNotFoundException($"Widget {request.WidgetId} not found");

        var widgetTypeName = widget.WidgetType.ToString();
        var dataSource = _dataSourceResolver.Resolve(widgetTypeName);
        var data = await dataSource.GetDataAsync(widget.Config, request.From, request.To, ct);

        return new WidgetDataDto
        {
            Labels = data.Labels.ToList(),
            Datasets = data.Datasets.Select(d => new WidgetDatasetDto
            {
                Label = d.Label,
                Data = d.Data.ToList(),
                Color = d.Color,
            }).ToList(),
            ChangePercent = data.ChangePercent,
            TrendDirection = data.TrendDirection,
        };
    }
}
