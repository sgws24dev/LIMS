using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Queries;

public record GetRolesQuery : IRequest<Result<List<RoleDto>>>;

public class GetRolesQueryHandler(IIdentityService identityService) : IRequestHandler<GetRolesQuery, Result<List<RoleDto>>>
{
    public Task<Result<List<RoleDto>>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
        => identityService.GetRolesAsync(cancellationToken);
}
