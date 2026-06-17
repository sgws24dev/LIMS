using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Domain.Interfaces;

public interface IPurchaseOrderRepository
{
    Task<PurchaseOrder?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PurchaseOrder?> GetByPoNumberAsync(string poNumber, CancellationToken ct = default);
    Task<PurchaseOrder?> GetByIdWithLinesAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<PurchaseOrder>> GetPagedAsync(
        PurchaseOrderStatus? status,
        Guid? vendorId,
        DateTime? fromDate,
        DateTime? toDate,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task<int> GetNextSequenceAsync(int year, CancellationToken ct = default);
    Task AddAsync(PurchaseOrder purchaseOrder, CancellationToken ct = default);
    Task UpdateAsync(PurchaseOrder purchaseOrder, CancellationToken ct = default);
}
