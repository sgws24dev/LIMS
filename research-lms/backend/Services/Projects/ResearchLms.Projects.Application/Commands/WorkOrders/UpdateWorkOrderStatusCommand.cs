using MediatR;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.Commands.WorkOrders;

public record UpdateWorkOrderStatusCommand(
    Guid WorkOrderId,
    WorkOrderStatus NewStatus,
    Guid UpdatedById
) : IRequest<Unit>;
