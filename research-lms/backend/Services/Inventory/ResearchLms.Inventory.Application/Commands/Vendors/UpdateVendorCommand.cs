using MediatR;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Application.Commands.Vendors;

public record UpdateVendorCommand(
    Guid VendorId,
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Address,
    string? Website,
    VendorStatus Status,
    PaymentTerms PaymentTerms,
    int LeadTimeDays,
    string? TaxId,
    string? Notes,
    int? Rating,
    bool IsActive
) : IRequest<Unit>;
