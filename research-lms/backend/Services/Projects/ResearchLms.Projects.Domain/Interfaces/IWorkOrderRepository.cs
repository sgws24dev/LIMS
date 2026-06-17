using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Domain.Interfaces;

public interface IWorkOrderRepository
{
    Task<WorkOrder?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<WorkOrder>> GetByProjectAsync(Guid projectId, CancellationToken ct = default);
    Task<PagedResult<WorkOrder>> GetPagedAsync(
        Guid? projectId,
        WorkOrderStatus? status,
        Guid? assignedToId,
        Priority? priority,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task AddAsync(WorkOrder workOrder, CancellationToken ct = default);
    Task UpdateAsync(WorkOrder workOrder, CancellationToken ct = default);
}
