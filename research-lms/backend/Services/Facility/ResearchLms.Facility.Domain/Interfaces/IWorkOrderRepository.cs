using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Domain.Interfaces;

public interface IWorkOrderRepository
{
    Task<WorkOrder?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<WorkOrder>> GetByMaintenanceRecordIdAsync(Guid maintenanceRecordId, CancellationToken ct = default);
    Task<IEnumerable<WorkOrder>> GetAllAsync(
        Guid? maintenanceRecordId = null, Guid? assigneeId = null,
        string? status = null, string? priority = null, CancellationToken ct = default);
    Task AddAsync(WorkOrder workOrder, CancellationToken ct = default);
    Task UpdateAsync(WorkOrder workOrder, CancellationToken ct = default);
}
