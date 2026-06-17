using MediatR;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.WorkOrders;

public class UpdateWorkOrderStatusCommandHandler : IRequestHandler<UpdateWorkOrderStatusCommand, Unit>
{
    private readonly IWorkOrderRepository _workOrderRepo;
    private readonly ICostCenterRepository _costCenterRepo;
    private readonly IProjectRepository _projectRepo;

    public UpdateWorkOrderStatusCommandHandler(
        IWorkOrderRepository workOrderRepo,
        ICostCenterRepository costCenterRepo,
        IProjectRepository projectRepo)
    {
        _workOrderRepo = workOrderRepo;
        _costCenterRepo = costCenterRepo;
        _projectRepo = projectRepo;
    }

    public async Task<Unit> Handle(UpdateWorkOrderStatusCommand request, CancellationToken ct)
    {
        var workOrder = await _workOrderRepo.GetByIdAsync(request.WorkOrderId, ct)
            ?? throw new KeyNotFoundException("Work order not found.");

        if (!workOrder.CanTransitionTo(request.NewStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {workOrder.Status} to {request.NewStatus}.");

        workOrder.UpdateStatus(request.NewStatus);

        if (request.NewStatus == WorkOrderStatus.Completed && workOrder.CostCenterId.HasValue)
        {
            var costCenter = await _costCenterRepo.GetByIdAsync(workOrder.CostCenterId.Value, ct);
            if (costCenter is not null)
            {
                costCenter.AddSpent(workOrder.BilledAmount);
                await _costCenterRepo.UpdateAsync(costCenter, ct);
            }

            var project = await _projectRepo.GetByIdAsync(workOrder.ProjectId, ct);
            if (project is not null)
            {
                project.AddSpent(workOrder.BilledAmount);
                await _projectRepo.UpdateAsync(project, ct);
            }
        }

        await _workOrderRepo.UpdateAsync(workOrder, ct);
        return Unit.Value;
    }
}
