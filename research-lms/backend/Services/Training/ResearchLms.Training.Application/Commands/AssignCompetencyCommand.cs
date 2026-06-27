using MediatR;
using ResearchLms.Training.Domain.Entities;
using ResearchLms.Training.Domain.Enums;
using ResearchLms.Training.Domain.Exceptions;
using ResearchLms.Training.Domain.Interfaces;

namespace ResearchLms.Training.Application.Commands;

public record AssignCompetencyCommand(
    Guid UserId,
    Guid CompetencyId,
    DateTime AchievedAt,
    DateTime? ExpiresAt
) : IRequest<Guid>;

public class AssignCompetencyCommandHandler : IRequestHandler<AssignCompetencyCommand, Guid>
{
    private readonly ICompetencyRepository _dbRepo;

    public AssignCompetencyCommandHandler(ICompetencyRepository dbRepo)
    {
        _dbRepo = dbRepo;
    }

    public async Task<Guid> Handle(AssignCompetencyCommand request, CancellationToken ct)
    {
        var competency = await _dbRepo.GetByIdAsync(request.CompetencyId, ct);
        if (competency is null)
            throw new NotFoundException("Competency not found.");

        var userCompetency = new UserCompetency(
            request.UserId,
            request.CompetencyId,
            request.AchievedAt,
            request.ExpiresAt,
            CompetencyStatus.Active,
            null);

        await _dbRepo.AddUserCompetencyAsync(userCompetency, ct);
        return userCompetency.Id;
    }
}
