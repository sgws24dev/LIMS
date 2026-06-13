using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Commands;

public record CreateTenantCommand(CreateTenantDto Data) : IRequest<Result<TenantDto>>;

public class CreateTenantCommandHandler(IIdentityService identityService) : IRequestHandler<CreateTenantCommand, Result<TenantDto>>
{
    public Task<Result<TenantDto>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
        => identityService.CreateTenantAsync(request.Data, cancellationToken);
}
