using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Queries;

public record GetRoleByIdQuery(Guid Id) : IRequest<Result<RoleDto>>;
public record GetTenantByIdQuery(Guid Id) : IRequest<Result<TenantDto>>;

public class GetRoleByIdQueryHandler(IIdentityService identityService)
    : IRequestHandler<GetRoleByIdQuery, Result<RoleDto>>
{
    public Task<Result<RoleDto>> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
        => identityService.GetRoleByIdAsync(request.Id, cancellationToken);
}

public class GetTenantByIdQueryHandler(IIdentityService identityService)
    : IRequestHandler<GetTenantByIdQuery, Result<TenantDto>>
{
    public Task<Result<TenantDto>> Handle(GetTenantByIdQuery request, CancellationToken cancellationToken)
        => identityService.GetTenantByIdAsync(request.Id, cancellationToken);
}