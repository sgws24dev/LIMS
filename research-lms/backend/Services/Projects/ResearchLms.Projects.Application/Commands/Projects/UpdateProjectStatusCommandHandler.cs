using MediatR;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.Projects;

public class UpdateProjectStatusCommandHandler : IRequestHandler<UpdateProjectStatusCommand, Unit>
{
    private readonly IProjectRepository _projectRepo;
    private readonly IWorkOrderRepository _workOrderRepo;

    public UpdateProjectStatusCommandHandler(IProjectRepository projectRepo, IWorkOrderRepository workOrderRepo)
    {
        _projectRepo = projectRepo;
        _workOrderRepo = workOrderRepo;
    }

    public async Task<Unit> Handle(UpdateProjectStatusCommand request, CancellationToken ct)
    {
        var project = await _projectRepo.GetByIdAsync(request.ProjectId, ct)
            ?? throw new KeyNotFoundException("Project not found.");

        if (!project.CanTransitionTo(request.NewStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {project.Status} to {request.NewStatus}.");

        if (request.NewStatus == ProjectStatus.Completed)
        {
            var workOrders = await _workOrderRepo.GetByProjectAsync(request.ProjectId, ct);
            if (workOrders.Any(w => w.Status != WorkOrderStatus.Completed && w.Status != WorkOrderStatus.Cancelled))
                throw new InvalidOperationException("All work orders must be completed before closing a project.");
        }

        project.UpdateStatus(request.NewStatus);
        await _projectRepo.UpdateAsync(project, ct);
        return Unit.Value;
    }
}
