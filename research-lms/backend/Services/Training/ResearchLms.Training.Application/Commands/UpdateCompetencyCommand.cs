using MediatR;
using ResearchLms.Training.Domain.Enums;
using ResearchLms.Training.Domain.Exceptions;
using ResearchLms.Training.Domain.Interfaces;

namespace ResearchLms.Training.Application.Commands;

public record UpdateCompetencyCommand(
    Guid Id,
    string Name,
    string Description,
    CompetencyCategory Category,
    int ValidityPeriodDays,
    bool RequiresRenewal
) : IRequest<Unit>;

public class UpdateCompetencyCommandHandler : IRequestHandler<UpdateCompetencyCommand, Unit>
{
    private readonly ICompetencyRepository _dbRepo;

    public UpdateCompetencyCommandHandler(ICompetencyRepository dbRepo)
    {
        _dbRepo = dbRepo;
    }

    public async Task<Unit> Handle(UpdateCompetencyCommand request, CancellationToken ct)
    {
        var competency = await _dbRepo.GetByIdAsync(request.Id, ct);
        if (competency is null)
            throw new NotFoundException("Competency not found.");

        competency.Update(
            request.Name,
            request.Description,
            request.Category,
            request.ValidityPeriodDays,
            request.RequiresRenewal);

        await _dbRepo.UpdateAsync(competency, ct);
        return Unit.Value;
    }
}
