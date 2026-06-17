using MediatR;
using ResearchLms.Projects.Application.DTOs;

namespace ResearchLms.Projects.Application.Commands.Issues;

public record SyncIssueToExternalCommand(
    Guid IssueId,
    string Provider
) : IRequest<ExternalIssueRefDto>;
