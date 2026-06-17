using MediatR;
using ResearchLms.Inventory.Application.DTOs;

namespace ResearchLms.Inventory.Application.Queries.Vendors;

public record GetVendorPerformanceQuery(Guid VendorId) : IRequest<VendorPerformanceSummaryDto?>;
