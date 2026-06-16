using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Commands;

public class UpdateWorkOrderCommandHandler : IRequestHandler<UpdateWorkOrderCommand, Result>
{
    private readonly IWorkOrderRepository _repository;

    public UpdateWorkOrderCommandHandler(IWorkOrderRepository repository)
        => _repository = repository;

    public async Task<Result> Handle(UpdateWorkOrderCommand request, CancellationToken ct)
    {
        var workOrder = await _repository.GetByIdAsync(request.Id, ct);
        if (workOrder is null)
            return Result.Failure("NOT_FOUND", "Work order not found.");

        var priority = Enum.Parse<WorkOrderPriority>(request.Data.Priority);
        workOrder.Update(
            request.Data.Title, request.Data.Description,
            request.Data.AssigneeId, request.Data.AssigneeName,
            priority, request.Data.DueDate);

        await _repository.UpdateAsync(workOrder, ct);
        return Result.Success();
    }
}
