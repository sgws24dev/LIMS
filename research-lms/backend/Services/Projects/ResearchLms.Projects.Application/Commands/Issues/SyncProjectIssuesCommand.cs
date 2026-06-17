using MediatR;
using ResearchLms.Projects.Application.DTOs;

namespace ResearchLms.Projects.Application.Commands.Issues;

public record SyncProjectIssuesCommand(
    Guid ProjectId,
    string Provider
) : IRequest<IssueSyncResultDto>;
