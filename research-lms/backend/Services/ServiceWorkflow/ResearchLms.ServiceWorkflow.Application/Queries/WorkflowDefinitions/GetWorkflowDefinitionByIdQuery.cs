using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.WorkflowDefinitions;

public record GetWorkflowDefinitionByIdQuery(Guid Id) : IRequest<ApiResponse<WorkflowDefinitionDto>>;
