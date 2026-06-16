using ResearchLms.Scheduling.Domain.ValueObjects;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public interface IAvailabilityService
{
    Task<IEnumerable<TimeSlot>> GetAvailableSlotsAsync(
        Guid resourceId,
        DateOnly date,
        CancellationToken ct);

    Task<IEnumerable<SlotAvailability>> GetSlotGridAsync(
        Guid resourceId,
        DateOnly from,
        DateOnly to,
        CancellationToken ct);

    Task InvalidateCacheAsync(Guid resourceId, DateOnly date);
}
