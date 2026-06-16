namespace ResearchLms.Scheduling.Domain.Entities;

public class MaintenanceWindow
{
    public Guid Id { get; set; }
    public Guid ResourceId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Reason { get; set; }
    public string Source { get; set; } = "Manual";
}
