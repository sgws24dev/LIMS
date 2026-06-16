using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.WorkflowDefinitions;

public record GetWorkflowDefinitionsQuery : IRequest<ApiResponse<IReadOnlyList<WorkflowDefinitionDto>>>;
