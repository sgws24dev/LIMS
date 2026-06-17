using MediatR;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.WorkOrders;

public class CreateWorkOrderCommandHandler : IRequestHandler<CreateWorkOrderCommand, Guid>
{
    private readonly IWorkOrderRepository _repository;

    public CreateWorkOrderCommandHandler(IWorkOrderRepository repository) => _repository = repository;

    public async Task<Guid> Handle(CreateWorkOrderCommand request, CancellationToken ct)
    {
        var workOrder = new WorkOrder(
            request.ProjectId, request.CostCenterId, request.Title,
            request.Description, request.Priority, request.AssignedToId,
            request.AssignedToName, request.EstimatedHours,
            request.StartDate, request.DueDate, request.Tags);
        await _repository.AddAsync(workOrder, ct);
        return workOrder.Id;
    }
}
