using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.FormDefinitions;

public record DeleteFormDefinitionCommand(
    Guid Id,
    string DeletedBy
) : IRequest<ApiResponse<bool>>;
