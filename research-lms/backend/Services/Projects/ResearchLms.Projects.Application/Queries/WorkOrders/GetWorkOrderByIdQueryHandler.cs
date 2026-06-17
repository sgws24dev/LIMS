using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.WorkOrders;

public class GetWorkOrderByIdQueryHandler : IRequestHandler<GetWorkOrderByIdQuery, WorkOrderDetailDto?>
{
    private readonly IWorkOrderRepository _repository;

    public GetWorkOrderByIdQueryHandler(IWorkOrderRepository repository) => _repository = repository;

    public async Task<WorkOrderDetailDto?> Handle(GetWorkOrderByIdQuery request, CancellationToken ct)
    {
        var w = await _repository.GetByIdAsync(request.WorkOrderId, ct);
        if (w is null) return null;

        return new WorkOrderDetailDto(
            w.Id, w.ProjectId, w.Project.Name, w.Title, w.Description,
            w.Status, w.Priority, w.AssignedToName, w.EstimatedHours, w.ActualHours,
            w.CostCenterId, null, w.BilledAmount,
            w.StartDate, w.DueDate,
            w.DueDate.HasValue && w.DueDate.Value < DateOnly.FromDateTime(DateTime.UtcNow) &&
            w.Status != WorkOrderStatus.Completed && w.Status != WorkOrderStatus.Cancelled,
            w.CompletedAt, w.Tags, w.CreatedAt,
            w.Issues.Select(i => new IssueDto(
                i.Id, i.Title, i.Status, i.Severity, i.Type, i.Priority,
                i.AssignedToName, i.ReportedByName, w.Project.Name, w.Title,
                i.ExternalId, i.ExternalUrl, i.ExternalProvider,
                i.DueDate, false, i.Tags, i.CreatedAt)));
    }
}
