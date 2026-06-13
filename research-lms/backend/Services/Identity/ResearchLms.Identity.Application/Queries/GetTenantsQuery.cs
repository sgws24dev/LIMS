using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Queries;

public record GetTenantsQuery : IRequest<Result<List<TenantDto>>>;

public class GetTenantsQueryHandler(IIdentityService identityService) : IRequestHandler<GetTenantsQuery, Result<List<TenantDto>>>
{
    public Task<Result<List<TenantDto>>> Handle(GetTenantsQuery request, CancellationToken cancellationToken)
        => identityService.GetTenantsAsync(cancellationToken);
}
