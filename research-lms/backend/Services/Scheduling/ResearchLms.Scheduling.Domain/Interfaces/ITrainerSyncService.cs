using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public interface ITrainerSyncService
{
    Task SyncTrainerCalendarAsync(Guid userId, SyncProvider provider, CancellationToken ct);
    Task<bool> IsTrainerAvailableAsync(Guid userId, DateTime slotStart, DateTime slotEnd, CancellationToken ct);
    Task<IEnumerable<TrainerAvailability>> GetAvailableTrainersAsync(string requiredRole, DateTime slotStart, DateTime slotEnd, CancellationToken ct);
}

public interface ITrainerAvailabilityRepository
{
    Task<TrainerAvailability?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<TrainerAvailability>> GetByUserAsync(Guid userId, CancellationToken ct);
    Task<IEnumerable<TrainerAvailability>> GetByUserAndRangeAsync(Guid userId, DateOnly weekStart, CancellationToken ct);
    Task<TrainerAvailability> AddAsync(TrainerAvailability availability, CancellationToken ct);
    Task UpdateAsync(TrainerAvailability availability, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<TrainerAvailability>> GetAvailableForSlotAsync(string requiredRole, DateTime slotStart, DateTime slotEnd, CancellationToken ct);
    Task<IEnumerable<string>> GetExternalEventIdsAsync(Guid userId, CancellationToken ct);
}
