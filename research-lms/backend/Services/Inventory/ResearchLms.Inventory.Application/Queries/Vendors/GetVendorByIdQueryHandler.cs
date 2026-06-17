using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.Vendors;

public class GetVendorByIdQueryHandler : IRequestHandler<GetVendorByIdQuery, VendorDetailDto?>
{
    private readonly IVendorRepository _vendorRepo;

    public GetVendorByIdQueryHandler(IVendorRepository vendorRepo)
    {
        _vendorRepo = vendorRepo;
    }

    public async Task<VendorDetailDto?> Handle(GetVendorByIdQuery request, CancellationToken ct)
    {
        var vendor = await _vendorRepo.GetByIdAsync(request.VendorId, ct);
        if (vendor is null) return null;

        return new VendorDetailDto(
            vendor.Id, vendor.Code, vendor.Name, vendor.ContactPerson,
            vendor.Email, vendor.Phone, null, null,
            vendor.IsActive ? "Active" : "Inactive", "Net30",
            vendor.LeadTimeDays, null, null, 0, 0, 0,
            vendor.CreatedAt, vendor.UpdatedAt ?? vendor.CreatedAt,
            Enumerable.Empty<PurchaseOrderSummaryDto>());
    }
}
