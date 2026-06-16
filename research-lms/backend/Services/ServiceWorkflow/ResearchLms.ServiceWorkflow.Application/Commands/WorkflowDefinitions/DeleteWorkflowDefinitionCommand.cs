using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public record DeleteWorkflowDefinitionCommand(Guid Id, string DeletedBy) : IRequest<ApiResponse<bool>>;
