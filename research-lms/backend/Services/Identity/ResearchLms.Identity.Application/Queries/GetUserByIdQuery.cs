using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Queries;

public record GetUserByIdQuery(Guid Id) : IRequest<Result<UserDto>>;

public class GetUserByIdQueryHandler(IIdentityService identityService) : IRequestHandler<GetUserByIdQuery, Result<UserDto>>
{
    public Task<Result<UserDto>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        => identityService.GetUserByIdAsync(request.Id, cancellationToken);
}
