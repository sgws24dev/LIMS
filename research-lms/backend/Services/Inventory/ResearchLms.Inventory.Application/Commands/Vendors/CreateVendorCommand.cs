using MediatR;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Application.Commands.Vendors;

public record CreateVendorCommand(
    string Code,
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Address,
    string? Website,
    PaymentTerms PaymentTerms,
    string? TaxId,
    string? Notes
) : IRequest<Guid>;
