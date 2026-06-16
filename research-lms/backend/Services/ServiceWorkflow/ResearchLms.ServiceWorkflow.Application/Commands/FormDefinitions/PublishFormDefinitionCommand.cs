using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.FormDefinitions;

public record PublishFormDefinitionCommand(
    Guid Id,
    string ModifiedBy
) : IRequest<ApiResponse<FormDefinitionDto>>;
