using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.Vendors;

public record GetVendorsQuery(
    string? NameFilter,
    VendorStatus? Status,
    int Page,
    int PageSize
) : IRequest<PagedResult<VendorDto>>;
