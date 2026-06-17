using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.Vendors;

public class GetVendorsQueryHandler : IRequestHandler<GetVendorsQuery, PagedResult<VendorDto>>
{
    private readonly IVendorRepository _vendorRepo;

    public GetVendorsQueryHandler(IVendorRepository vendorRepo)
    {
        _vendorRepo = vendorRepo;
    }

    public async Task<PagedResult<VendorDto>> Handle(GetVendorsQuery request, CancellationToken ct)
    {
        var vendors = await _vendorRepo.GetAllAsync(false, ct);
        var list = vendors.ToList();
        var items = list
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(v => new VendorDto(
                v.Id, v.Code, v.Name, v.ContactPerson, v.Email, v.Phone,
                null, "Active", "Net30", v.LeadTimeDays, v.IsActive,
                0, 0, v.CreatedAt, v.UpdatedAt ?? v.CreatedAt));

        return new PagedResult<VendorDto>(
            items, list.Count, request.Page, request.PageSize);
    }
}
