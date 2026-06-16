using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.WorkflowInstances;

public record GetAvailableTriggersQuery(Guid InstanceId) : IRequest<ApiResponse<IReadOnlyList<AvailableTriggerDto>>>;
