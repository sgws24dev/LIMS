using MediatR;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Commands;

public record DeleteUserCommand(Guid Id, Guid DeletedBy) : IRequest<Result>;

public class DeleteUserCommandHandler(IIdentityService identityService) : IRequestHandler<DeleteUserCommand, Result>
{
    public Task<Result> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        => identityService.DeleteUserAsync(request.Id, request.DeletedBy, cancellationToken);
}
