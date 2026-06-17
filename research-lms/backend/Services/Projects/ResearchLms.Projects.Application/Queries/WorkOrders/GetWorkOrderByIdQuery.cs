using MediatR;
using ResearchLms.Projects.Application.DTOs;

namespace ResearchLms.Projects.Application.Queries.WorkOrders;

public record GetWorkOrderByIdQuery(Guid WorkOrderId) : IRequest<WorkOrderDetailDto?>;
