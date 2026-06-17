using MediatR;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.CostCenters;

public class CreateCostCenterCommandHandler : IRequestHandler<CreateCostCenterCommand, Guid>
{
    private readonly ICostCenterRepository _repository;

    public CreateCostCenterCommandHandler(ICostCenterRepository repository) => _repository = repository;

    public async Task<Guid> Handle(CreateCostCenterCommand request, CancellationToken ct)
    {
        var existing = await _repository.GetByCodeAsync(request.Code, ct);
        if (existing is not null)
            throw new DuplicateKeyException($"Cost center code '{request.Code}' already exists.");

        var costCenter = new CostCenter(
            request.Code, request.Name, request.Description,
            request.BudgetAmount, request.ManagerId,
            request.ManagerName, request.FiscalYear);
        await _repository.AddAsync(costCenter, ct);
        return costCenter.Id;
    }
}
