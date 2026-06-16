using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.FormDefinitions;

public record CreateFormDefinitionCommand(
    string Title,
    string? Description,
    string Schema,
    string Category,
    string CreatedBy
) : IRequest<ApiResponse<FormDefinitionDto>>;
