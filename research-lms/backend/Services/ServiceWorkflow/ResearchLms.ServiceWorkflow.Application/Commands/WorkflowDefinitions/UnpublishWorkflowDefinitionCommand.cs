using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public record UnpublishWorkflowDefinitionCommand(Guid Id, string UpdatedBy) : IRequest<ApiResponse<bool>>;
