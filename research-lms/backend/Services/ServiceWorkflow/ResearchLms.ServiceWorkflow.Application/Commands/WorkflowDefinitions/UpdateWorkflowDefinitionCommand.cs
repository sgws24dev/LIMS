using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public record UpdateWorkflowDefinitionCommand(
    Guid Id,
    string Name,
    string? Description,
    string States,
    string Transitions,
    string? EntityTypeHint,
    string UpdatedBy
) : IRequest<ApiResponse<WorkflowDefinitionDto>>;
