using MediatR;
using ResearchLms.Training.Domain.Entities;
using ResearchLms.Training.Domain.Enums;
using ResearchLms.Training.Domain.Interfaces;

namespace ResearchLms.Training.Application.Commands;

public record CreateCompetencyCommand(
    string Name,
    string Description,
    CompetencyCategory Category,
    int ValidityPeriodDays,
    bool RequiresRenewal
) : IRequest<Guid>;

public class CreateCompetencyCommandHandler : IRequestHandler<CreateCompetencyCommand, Guid>
{
    private readonly ICompetencyRepository _dbRepo;

    public CreateCompetencyCommandHandler(ICompetencyRepository dbRepo)
    {
        _dbRepo = dbRepo;
    }

    public async Task<Guid> Handle(CreateCompetencyCommand request, CancellationToken ct)
    {
        var competency = new Competency(
            request.Name,
            request.Description,
            request.Category,
            request.ValidityPeriodDays,
            request.RequiresRenewal);

        await _dbRepo.AddAsync(competency, ct);
        return competency.Id;
    }
}
