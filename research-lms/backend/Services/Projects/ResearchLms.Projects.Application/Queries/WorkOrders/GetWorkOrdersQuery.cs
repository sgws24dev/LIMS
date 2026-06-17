using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.WorkOrders;

public record GetWorkOrdersQuery(
    Guid? ProjectId,
    WorkOrderStatus? Status,
    Guid? AssignedToId,
    Priority? Priority,
    int Page,
    int PageSize
) : IRequest<PagedResult<WorkOrderDto>>;
