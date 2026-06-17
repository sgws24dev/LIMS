using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.Vendors;

public class GetVendorPerformanceQueryHandler : IRequestHandler<GetVendorPerformanceQuery, VendorPerformanceSummaryDto?>
{
    private readonly IVendorRepository _vendorRepo;

    public GetVendorPerformanceQueryHandler(IVendorRepository vendorRepo)
    {
        _vendorRepo = vendorRepo;
    }

    public async Task<VendorPerformanceSummaryDto?> Handle(GetVendorPerformanceQuery request, CancellationToken ct)
    {
        var vendor = await _vendorRepo.GetByIdAsync(request.VendorId, ct);
        if (vendor is null) return null;

        return new VendorPerformanceSummaryDto(
            vendor.Id, vendor.Name, 0, 0, 0, 0, 0, 0, 0);
    }
}
