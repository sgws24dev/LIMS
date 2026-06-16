namespace ResearchLms.Facilities.Application.DTOs;

public record MaintenanceRecordDto(
    Guid Id, Guid AssetId, string AssetName, string Type, DateOnly ScheduledDate,
    DateOnly? CompletedDate, string Status, string? TechnicianName, decimal? Cost);

public record MaintenanceCalendarEventDto(
    Guid Id, string Title, DateOnly ScheduledDate, string Status, Guid AssetId, string Color);

public record WorkOrderDto(
    Guid Id, Guid MaintenanceRecordId, string Title, string? Description,
    Guid? AssigneeId, string? AssigneeName, string Priority, string Status,
    DateOnly? DueDate, DateOnly? ResolvedDate, string? ResolutionNotes);

public record CreateMaintenanceRecordRequest(
    Guid AssetId, string Type, DateOnly ScheduledDate, string? Description,
    string? Notes, decimal? Cost, string? TechnicianName);

public record UpdateMaintenanceRecordRequest(
    string Type, DateOnly ScheduledDate, string? Description, string? Notes, decimal? Cost);

public record CompleteMaintenanceRecordRequest(DateOnly CompletedDate, string? Notes, decimal? Cost);

public record CreateWorkOrderRequest(
    string Title, string? Description, Guid? AssigneeId, string? AssigneeName,
    string Priority, DateOnly? DueDate);

public record UpdateWorkOrderRequest(
    string Title, string? Description, Guid? AssigneeId, string? AssigneeName,
    string Priority, DateOnly? DueDate);

public record ResolveWorkOrderRequest(string? ResolutionNotes);
