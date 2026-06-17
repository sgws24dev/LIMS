using MediatR;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.WorkOrders;

public class UpdateWorkOrderCommandHandler : IRequestHandler<UpdateWorkOrderCommand, Unit>
{
    private readonly IWorkOrderRepository _repository;

    public UpdateWorkOrderCommandHandler(IWorkOrderRepository repository) => _repository = repository;

    public async Task<Unit> Handle(UpdateWorkOrderCommand request, CancellationToken ct)
    {
        var workOrder = await _repository.GetByIdAsync(request.WorkOrderId, ct)
            ?? throw new KeyNotFoundException("Work order not found.");
        workOrder.Update(request.CostCenterId, request.Title, request.Description,
            request.Priority, request.AssignedToId, request.AssignedToName,
            request.EstimatedHours, request.ActualHours,
            request.StartDate, request.DueDate, request.Tags);
        await _repository.UpdateAsync(workOrder, ct);
        return Unit.Value;
    }
}
