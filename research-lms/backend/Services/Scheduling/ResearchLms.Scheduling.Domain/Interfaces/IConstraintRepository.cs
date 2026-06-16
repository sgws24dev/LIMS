using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.ValueObjects;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public interface IConstraintRepository
{
    Task<IEnumerable<Constraint>> GetActiveByResourceAsync(Guid resourceId, CancellationToken ct);
    Task<IEnumerable<Constraint>> GetByFilterAsync(Guid? resourceId, ConstraintType? type, CancellationToken ct);
    Task<Constraint?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Constraint> AddAsync(Constraint constraint, CancellationToken ct);
    Task UpdateAsync(Constraint constraint, CancellationToken ct);
    Task DeleteAsync(Constraint constraint, CancellationToken ct);
}

public interface IWaitlistRepository
{
    Task<WaitlistEntry?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<bool> HasExistingWaitingAsync(Guid userId, Guid resourceId, DateOnly date,
        TimeOnly start, TimeOnly end, CancellationToken ct);
    Task<(IEnumerable<WaitlistEntry> Items, int TotalCount)> GetPagedAsync(
        Guid? userId, Guid? resourceId, WaitlistStatus? status, int page, int pageSize, CancellationToken ct);
    Task<WaitlistEntry?> GetNextForPromotionAsync(Guid resourceId, DateOnly date,
        TimeOnly start, TimeOnly end, CancellationToken ct);
    Task<IEnumerable<WaitlistEntry>> GetStalePromotionsAsync(CancellationToken ct);
    Task<WaitlistEntry> AddAsync(WaitlistEntry entry, CancellationToken ct);
    Task UpdateAsync(WaitlistEntry entry, CancellationToken ct);
}

public interface IMaintenanceWindowRepository
{
    Task<IEnumerable<MaintenanceWindow>> GetByResourceAndRangeAsync(
        Guid resourceId, DateTime from, DateTime to, CancellationToken ct);
    Task<MaintenanceWindow?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<MaintenanceWindow> AddAsync(MaintenanceWindow window, CancellationToken ct);
    Task DeleteAsync(MaintenanceWindow window, CancellationToken ct);
}

public interface IOperatingHoursRepository
{
    Task<ResourceOperatingHours?> GetByResourceIdAsync(Guid resourceId, CancellationToken ct);
    Task AddOrUpdateAsync(ResourceOperatingHours hours, CancellationToken ct);
}
