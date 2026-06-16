using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Domain.Entities;

public class BookingResource
{
    public Guid ResourceId { get; set; }
    public Guid TenantId { get; set; }
    public ResourceType ResourceType { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string? Location { get; set; }
    public Guid? FacilityId { get; set; }
    public string? FacilityName { get; set; }
    public decimal HourlyRate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
}
