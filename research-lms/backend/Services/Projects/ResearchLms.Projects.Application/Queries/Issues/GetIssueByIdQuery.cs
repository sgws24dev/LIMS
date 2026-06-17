using MediatR;
using ResearchLms.Projects.Application.DTOs;

namespace ResearchLms.Projects.Application.Queries.Issues;

public record GetIssueByIdQuery(Guid IssueId) : IRequest<IssueDetailDto?>;
