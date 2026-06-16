using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Queries;

public class GetWorkOrdersQueryHandler
    : IRequestHandler<GetWorkOrdersQuery, Result<IEnumerable<WorkOrderDto>>>
{
    private readonly IWorkOrderRepository _repository;

    public GetWorkOrdersQueryHandler(IWorkOrderRepository repository)
        => _repository = repository;

    public async Task<Result<IEnumerable<WorkOrderDto>>> Handle(
        GetWorkOrdersQuery request, CancellationToken ct)
    {
        var workOrders = await _repository.GetAllAsync(
            request.MaintenanceRecordId, request.AssigneeId,
            request.Status, request.Priority, ct);

        return Result.Success(workOrders.Select(ToDto));
    }

    private static WorkOrderDto ToDto(WorkOrder w) => new(
        w.Id, w.MaintenanceRecordId, w.Title, w.Description,
        w.AssigneeId, w.AssigneeName, w.Priority.ToString(), w.Status.ToString(),
        w.DueDate, w.ResolvedDate, w.ResolutionNotes);
}
