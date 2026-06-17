using MediatR;
using ResearchLms.Inventory.Application.DTOs;

namespace ResearchLms.Inventory.Application.Queries.Vendors;

public record GetVendorByIdQuery(Guid VendorId) : IRequest<VendorDetailDto?>;
