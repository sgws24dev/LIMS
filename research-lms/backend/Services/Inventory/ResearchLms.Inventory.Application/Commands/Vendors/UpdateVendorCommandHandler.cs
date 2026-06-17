using MediatR;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.Vendors;

public class UpdateVendorCommandHandler : IRequestHandler<UpdateVendorCommand, Unit>
{
    private readonly IVendorRepository _repository;

    public UpdateVendorCommandHandler(IVendorRepository repository) => _repository = repository;

    public async Task<Unit> Handle(UpdateVendorCommand request, CancellationToken ct)
    {
        var vendor = await _repository.GetByIdAsync(request.VendorId, ct)
            ?? throw new KeyNotFoundException("Vendor not found.");

        vendor.Update(request.Name, request.ContactPerson, request.Email,
            request.Phone, request.Address, request.LeadTimeDays, request.IsActive);

        await _repository.UpdateAsync(vendor, ct);
        return Unit.Value;
    }
}
