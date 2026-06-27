namespace ResearchLms.Billing.Application.DTOs;

public class DashboardWidgetDto
{
    public Guid Id { get; set; }
    public Guid DashboardId { get; set; }
    public string WidgetType { get; set; } = string.Empty;
    public string Config { get; set; } = string.Empty;
    public int PositionX { get; set; }
    public int PositionY { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public bool IsVisible { get; set; }
    public DateTime CreatedAt { get; set; }
}
