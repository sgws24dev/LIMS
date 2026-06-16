namespace ResearchLms.Scheduling.Domain.ValueObjects;

public enum SlotStatus
{
    Available,
    Booked,
    Maintenance,
    Blackout,
    OutsideHours
}

public record SlotAvailability(
    DateTime SlotStart,
    DateTime SlotEnd,
    SlotStatus Status,
    string? UnavailableReason
);
