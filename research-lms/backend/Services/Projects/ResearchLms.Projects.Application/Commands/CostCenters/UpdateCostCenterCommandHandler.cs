using MediatR;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.CostCenters;

public class UpdateCostCenterCommandHandler : IRequestHandler<UpdateCostCenterCommand, Unit>
{
    private readonly ICostCenterRepository _repository;

    public UpdateCostCenterCommandHandler(ICostCenterRepository repository) => _repository = repository;

    public async Task<Unit> Handle(UpdateCostCenterCommand request, CancellationToken ct)
    {
        var costCenter = await _repository.GetByIdAsync(request.CostCenterId, ct)
            ?? throw new KeyNotFoundException("Cost center not found.");
        costCenter.Update(request.Name, request.Description, request.BudgetAmount,
            request.ManagerId, request.ManagerName, request.IsActive);
        await _repository.UpdateAsync(costCenter, ct);
        return Unit.Value;
    }
}
