using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Queries;

public record LoginQuery(LoginRequest Request, string IpAddress) : IRequest<Result<LoginResponse>>;

public class LoginQueryHandler(IIdentityService identityService) : IRequestHandler<LoginQuery, Result<LoginResponse>>
{
    public Task<Result<LoginResponse>> Handle(LoginQuery request, CancellationToken cancellationToken)
        => identityService.LoginAsync(request.Request, request.IpAddress, cancellationToken);
}
