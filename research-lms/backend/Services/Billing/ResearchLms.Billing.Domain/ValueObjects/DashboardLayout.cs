namespace ResearchLms.Billing.Domain.ValueObjects;

public class DashboardLayout
{
    public List<LayoutWidget> Widgets { get; set; } = new();
}

public class LayoutWidget
{
    public Guid WidgetId { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
}
