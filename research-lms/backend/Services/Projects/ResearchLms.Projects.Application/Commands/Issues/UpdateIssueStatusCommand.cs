using MediatR;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.Commands.Issues;

public record UpdateIssueStatusCommand(
    Guid IssueId,
    IssueStatus NewStatus,
    Guid UpdatedById
) : IRequest<Unit>;
