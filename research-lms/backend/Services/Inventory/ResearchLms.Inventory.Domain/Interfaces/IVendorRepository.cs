using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Domain.Interfaces;

public interface IVendorRepository
{
    Task<Vendor?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Vendor?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<IEnumerable<Vendor>> GetAllAsync(bool activeOnly, CancellationToken ct = default);
    Task<PagedResult<Vendor>> GetPagedAsync(
        string? nameFilter,
        VendorStatus? status,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task<VendorPerformanceSummary> GetPerformanceSummaryAsync(Guid vendorId, CancellationToken ct = default);
    Task AddAsync(Vendor vendor, CancellationToken ct = default);
    Task UpdateAsync(Vendor vendor, CancellationToken ct = default);
}

public record VendorPerformanceSummary(
    Guid VendorId,
    string VendorName,
    int TotalOrders,
    decimal TotalOrderValue,
    decimal AverageOrderValue,
    int PendingOrderCount
);
