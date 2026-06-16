using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.FormDefinitions;

public record GetFormDefinitionByIdQuery(Guid Id) : IRequest<ApiResponse<FormDefinitionDto>>;
