using MediatR;
using ResearchLms.Training.Domain.Entities;
using ResearchLms.Training.Domain.Enums;
using ResearchLms.Training.Domain.Exceptions;
using ResearchLms.Training.Domain.Interfaces;

namespace ResearchLms.Training.Application.Commands;

public record RenewCompetencyCommand(Guid Id, DateTime ExpiresAt) : IRequest<Unit>;

public class RenewCompetencyCommandHandler : IRequestHandler<RenewCompetencyCommand, Unit>
{
    private readonly ICompetencyRepository _dbRepo;

    public RenewCompetencyCommandHandler(ICompetencyRepository dbRepo)
    {
        _dbRepo = dbRepo;
    }

    public async Task<Unit> Handle(RenewCompetencyCommand request, CancellationToken ct)
    {
        var userCompetency = await _dbRepo.GetUserCompetencyByIdAsync(request.Id, ct);
        if (userCompetency is null)
            throw new NotFoundException("User competency not found.");

        userCompetency.Renew(request.ExpiresAt);
        await _dbRepo.UpdateUserCompetencyAsync(userCompetency, ct);
        return Unit.Value;
    }
}
