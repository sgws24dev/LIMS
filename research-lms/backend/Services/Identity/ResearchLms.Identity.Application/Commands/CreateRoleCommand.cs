using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Commands;

public record CreateRoleCommand(CreateRoleDto Data) : IRequest<Result<RoleDto>>;

public class CreateRoleCommandHandler(IIdentityService identityService) : IRequestHandler<CreateRoleCommand, Result<RoleDto>>
{
    public Task<Result<RoleDto>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
        => identityService.CreateRoleAsync(request.Data, cancellationToken);
}
