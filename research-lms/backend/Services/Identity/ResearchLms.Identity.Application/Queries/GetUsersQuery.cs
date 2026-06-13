using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Queries;

public record GetUsersQuery(UserFilter Filter) : IRequest<Result<PagedResult<UserDto>>>;

public class GetUsersQueryHandler(IIdentityService identityService) : IRequestHandler<GetUsersQuery, Result<PagedResult<UserDto>>>
{
    public Task<Result<PagedResult<UserDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
        => identityService.GetUsersAsync(request.Filter, cancellationToken);
}
