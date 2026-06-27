using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class DashboardWidget : BaseEntity
{
    public Guid DashboardId { get; private set; }
    public WidgetType WidgetType { get; private set; }
    public string Config { get; private set; }
    public int PositionX { get; private set; }
    public int PositionY { get; private set; }
    public int Width { get; private set; }
    public int Height { get; private set; }
    public bool IsVisible { get; private set; }

    public DashboardDefinition Dashboard { get; private set; } = null!;

    private DashboardWidget() { Config = null!; }

    public DashboardWidget(
        Guid dashboardId,
        WidgetType widgetType,
        string config,
        int positionX,
        int positionY,
        int width,
        int height,
        string createdBy)
    {
        DashboardId = dashboardId;
        WidgetType = widgetType;
        Config = config;
        PositionX = positionX;
        PositionY = positionY;
        Width = width;
        Height = height;
        IsVisible = true;
        MarkCreated(createdBy);
    }

    public void UpdateConfig(string config, string modifiedBy)
    {
        Config = config;
        MarkUpdated(modifiedBy);
    }

    public void UpdatePosition(int positionX, int positionY, int width, int height, string modifiedBy)
    {
        PositionX = positionX;
        PositionY = positionY;
        Width = width;
        Height = height;
        MarkUpdated(modifiedBy);
    }

    public void SetVisibility(bool isVisible, string modifiedBy)
    {
        IsVisible = isVisible;
        MarkUpdated(modifiedBy);
    }
}
