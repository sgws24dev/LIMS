namespace ResearchLms.Scheduling.Application.DTOs;

public record TimeSlotDto(DateTime Start, DateTime End, double DurationHours);

public record SlotAvailabilityDto(
    DateTime SlotStart,
    DateTime SlotEnd,
    string Status,
    string? UnavailableReason
);

public record ResourceOperatingHoursDto(
    Guid ResourceId,
    TimeOnly? MondayStart, TimeOnly? MondayEnd,
    TimeOnly? TuesdayStart, TimeOnly? TuesdayEnd,
    TimeOnly? WednesdayStart, TimeOnly? WednesdayEnd,
    TimeOnly? ThursdayStart, TimeOnly? ThursdayEnd,
    TimeOnly? FridayStart, TimeOnly? FridayEnd,
    TimeOnly? SaturdayStart, TimeOnly? SaturdayEnd,
    TimeOnly? SundayStart, TimeOnly? SundayEnd,
    string Timezone
);

public record UpdateOperatingHoursRequest(
    TimeOnly? MondayStart, TimeOnly? MondayEnd,
    TimeOnly? TuesdayStart, TimeOnly? TuesdayEnd,
    TimeOnly? WednesdayStart, TimeOnly? WednesdayEnd,
    TimeOnly? ThursdayStart, TimeOnly? ThursdayEnd,
    TimeOnly? FridayStart, TimeOnly? FridayEnd,
    TimeOnly? SaturdayStart, TimeOnly? SaturdayEnd,
    TimeOnly? SundayStart, TimeOnly? SundayEnd,
    string? Timezone
);

public record AddMaintenanceWindowRequest(
    Guid ResourceId,
    DateTime StartTime,
    DateTime EndTime,
    string? Reason
);
