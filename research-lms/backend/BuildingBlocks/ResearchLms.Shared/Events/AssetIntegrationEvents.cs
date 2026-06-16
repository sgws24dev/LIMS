namespace ResearchLms.Shared.Events;

public record AssetCreatedEvent(
    Guid AssetId,
    Guid TenantId,
    string Name,
    string Identifier,
    string AssetType,
    string? Location,
    Guid? FacilityId,
    string? FacilityName
) : BaseEvent;

public record AssetUpdatedEvent(
    Guid AssetId,
    Guid TenantId,
    string Name,
    string Identifier,
    string AssetType,
    string? Location,
    Guid? FacilityId,
    string? FacilityName
) : BaseEvent;

public record AssetDecommissionedEvent(
    Guid AssetId,
    Guid TenantId,
    string? Reason
) : BaseEvent;

public record MaintenanceScheduledEvent(
    Guid AssetId,
    Guid TenantId,
    DateTime StartTime,
    DateTime EndTime,
    string? Type
) : BaseEvent;
