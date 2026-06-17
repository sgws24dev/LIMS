using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.WorkOrders;

public class GetWorkOrdersQueryHandler : IRequestHandler<GetWorkOrdersQuery, PagedResult<WorkOrderDto>>
{
    private readonly IWorkOrderRepository _repository;

    public GetWorkOrdersQueryHandler(IWorkOrderRepository repository) => _repository = repository;

    public async Task<PagedResult<WorkOrderDto>> Handle(GetWorkOrdersQuery request, CancellationToken ct)
    {
        var result = await _repository.GetPagedAsync(request.ProjectId, request.Status,
            request.AssignedToId, request.Priority, request.Page, request.PageSize, ct);
        return new PagedResult<WorkOrderDto>(
            result.Items.Select(w => new WorkOrderDto(
                w.Id, w.ProjectId, w.Project.Name, w.Title, w.Status, w.Priority,
                w.AssignedToName, w.EstimatedHours, w.ActualHours,
                w.DueDate,
                w.DueDate.HasValue && w.DueDate.Value < DateOnly.FromDateTime(DateTime.UtcNow) &&
                w.Status != WorkOrderStatus.Completed && w.Status != WorkOrderStatus.Cancelled,
                w.Tags, w.CreatedAt)),
            result.TotalCount, result.Page, result.PageSize);
    }
}
