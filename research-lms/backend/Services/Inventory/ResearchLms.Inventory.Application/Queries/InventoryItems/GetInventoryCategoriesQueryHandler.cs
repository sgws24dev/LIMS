using MediatR;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public class GetInventoryCategoriesQueryHandler : IRequestHandler<GetInventoryCategoriesQuery, IEnumerable<string>>
{
    private readonly IInventoryItemRepository _repository;

    public GetInventoryCategoriesQueryHandler(IInventoryItemRepository repository) => _repository = repository;

    public async Task<IEnumerable<string>> Handle(GetInventoryCategoriesQuery request, CancellationToken ct)
        => await _repository.GetCategoriesAsync(ct);
}
