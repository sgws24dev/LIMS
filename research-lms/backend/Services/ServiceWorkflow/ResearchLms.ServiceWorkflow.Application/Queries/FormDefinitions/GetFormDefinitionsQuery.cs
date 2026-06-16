using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.FormDefinitions;

public record GetFormDefinitionsQuery(
    Guid TenantId,
    bool? PublishedOnly = null
) : IRequest<ApiResponse<IReadOnlyList<FormDefinitionDto>>>;
