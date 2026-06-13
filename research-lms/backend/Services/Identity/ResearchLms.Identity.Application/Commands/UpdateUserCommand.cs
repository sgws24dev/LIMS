using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Commands;

public record UpdateUserCommand(Guid Id, UpdateUserDto Data, Guid UpdatedBy) : IRequest<Result<UserDto>>;

public class UpdateUserCommandHandler(IIdentityService identityService) : IRequestHandler<UpdateUserCommand, Result<UserDto>>
{
    public Task<Result<UserDto>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        => identityService.UpdateUserAsync(request.Id, request.Data, request.UpdatedBy, cancellationToken);
}
