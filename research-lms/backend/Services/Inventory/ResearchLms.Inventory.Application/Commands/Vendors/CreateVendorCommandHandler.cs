using MediatR;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.Vendors;

public class CreateVendorCommandHandler : IRequestHandler<CreateVendorCommand, Guid>
{
    private readonly IVendorRepository _repository;

    public CreateVendorCommandHandler(IVendorRepository repository) => _repository = repository;

    public async Task<Guid> Handle(CreateVendorCommand request, CancellationToken ct)
    {
        var existing = await _repository.GetByCodeAsync(request.Code, ct);
        if (existing is not null)
            throw new DuplicateKeyException($"A vendor with code '{request.Code}' already exists.");

        var vendor = new Vendor(
            request.Name, request.Code, request.ContactPerson,
            request.Email, request.Phone, request.Address);

        await _repository.AddAsync(vendor, ct);
        return vendor.Id;
    }
}
