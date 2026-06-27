using MediatR;
using ResearchLms.Training.Domain.Exceptions;
using ResearchLms.Training.Domain.Interfaces;

namespace ResearchLms.Training.Application.Commands;

public record DeleteCompetencyCommand(Guid Id) : IRequest<Unit>;

public class DeleteCompetencyCommandHandler : IRequestHandler<DeleteCompetencyCommand, Unit>
{
    private readonly ICompetencyRepository _dbRepo;

    public DeleteCompetencyCommandHandler(ICompetencyRepository dbRepo)
    {
        _dbRepo = dbRepo;
    }

    public async Task<Unit> Handle(DeleteCompetencyCommand request, CancellationToken ct)
    {
        var competency = await _dbRepo.GetByIdAsync(request.Id, ct);
        if (competency is null)
            throw new NotFoundException("Competency not found.");

        await _dbRepo.DeleteAsync(competency, ct);
        return Unit.Value;
    }
}
