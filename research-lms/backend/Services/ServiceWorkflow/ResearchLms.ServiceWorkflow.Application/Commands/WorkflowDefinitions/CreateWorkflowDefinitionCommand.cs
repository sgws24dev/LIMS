using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public record CreateWorkflowDefinitionCommand(
    string Name,
    string? Description,
    string States,
    string Transitions,
    string? EntityTypeHint,
    string CreatedBy
) : IRequest<ApiResponse<WorkflowDefinitionDto>>;
