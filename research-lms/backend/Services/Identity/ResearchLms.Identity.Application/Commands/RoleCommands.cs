using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Commands;

public record UpdateRoleCommand(Guid Id, UpdateRoleDto Data) : IRequest<Result<RoleDto>>;
public record DeleteRoleCommand(Guid Id) : IRequest<Result>;

public record UpdateTenantCommand(Guid Id, CreateTenantDto Data) : IRequest<Result<TenantDto>>;
public record DeleteTenantCommand(Guid Id) : IRequest<Result>;

public class UpdateRoleCommandHandler(IIdentityService identityService)
    : IRequestHandler<UpdateRoleCommand, Result<RoleDto>>
{
    public Task<Result<RoleDto>> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
        => identityService.UpdateRoleAsync(request.Id, request.Data, cancellationToken);
}

public class DeleteRoleCommandHandler(IIdentityService identityService)
    : IRequestHandler<DeleteRoleCommand, Result>
{
    public Task<Result> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
        => identityService.DeleteRoleAsync(request.Id, cancellationToken);
}

public class UpdateTenantCommandHandler(IIdentityService identityService)
    : IRequestHandler<UpdateTenantCommand, Result<TenantDto>>
{
    public Task<Result<TenantDto>> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
        => identityService.UpdateTenantAsync(request.Id, request.Data, cancellationToken);
}

public class DeleteTenantCommandHandler(IIdentityService identityService)
    : IRequestHandler<DeleteTenantCommand, Result>
{
    public Task<Result> Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
        => identityService.DeleteTenantAsync(request.Id, cancellationToken);
}