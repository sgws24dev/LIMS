using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.FormDefinitions;

public record UpdateFormDefinitionCommand(
    Guid Id,
    string Title,
    string? Description,
    string Schema,
    string Fields,
    string Category,
    string ModifiedBy
) : IRequest<ApiResponse<FormDefinitionDto>>;
