namespace ResearchLms.Billing.Application.DTOs;

public class DashboardDefinitionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Layout { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool IsShared { get; set; }
    public string? SharedWith { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<DashboardWidgetDto> Widgets { get; set; } = new();
}
