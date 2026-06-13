using MediatR;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Commands;

public record CreateUserCommand(CreateUserDto Data, Guid CreatedBy) : IRequest<Result<UserDto>>;

public class CreateUserCommandHandler(IIdentityService identityService) : IRequestHandler<CreateUserCommand, Result<UserDto>>
{
    public Task<Result<UserDto>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        => identityService.CreateUserAsync(request.Data, request.CreatedBy, cancellationToken);
}
