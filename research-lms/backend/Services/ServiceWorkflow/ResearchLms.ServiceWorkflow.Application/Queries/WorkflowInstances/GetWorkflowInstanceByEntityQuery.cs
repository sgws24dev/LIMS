using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.WorkflowInstances;

public record GetWorkflowInstanceByEntityQuery(string EntityType, Guid EntityId) : IRequest<ApiResponse<WorkflowInstanceDto>>;
