using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Commands;

public class CreateWorkOrderCommandHandler : IRequestHandler<CreateWorkOrderCommand, Result<Guid>>
{
    private readonly IWorkOrderRepository _repository;

    public CreateWorkOrderCommandHandler(IWorkOrderRepository repository)
        => _repository = repository;

    public async Task<Result<Guid>> Handle(CreateWorkOrderCommand request, CancellationToken ct)
    {
        var priority = Enum.Parse<WorkOrderPriority>(request.Data.Priority);
        var workOrder = new WorkOrder(
            request.MaintenanceRecordId, request.Data.Title, request.Data.Description,
            request.Data.AssigneeId, request.Data.AssigneeName,
            priority, request.Data.DueDate);

        await _repository.AddAsync(workOrder, ct);
        return Result.Success(workOrder.Id);
    }
}
