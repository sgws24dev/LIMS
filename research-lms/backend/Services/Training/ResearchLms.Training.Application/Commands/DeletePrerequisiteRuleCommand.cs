using MediatR;
using ResearchLms.Training.Domain.Exceptions;
using ResearchLms.Training.Domain.Interfaces;

namespace ResearchLms.Training.Application.Commands;

public record DeletePrerequisiteRuleCommand(Guid Id) : IRequest<Unit>;

public class DeletePrerequisiteRuleCommandHandler : IRequestHandler<DeletePrerequisiteRuleCommand, Unit>
{
    private readonly ICompetencyRepository _dbRepo;

    public DeletePrerequisiteRuleCommandHandler(ICompetencyRepository dbRepo)
    {
        _dbRepo = dbRepo;
    }

    public async Task<Unit> Handle(DeletePrerequisiteRuleCommand request, CancellationToken ct)
    {
        var rule = await _dbRepo.GetPrerequisiteRuleByIdAsync(request.Id, ct);
        if (rule is null)
            throw new NotFoundException("Prerequisite rule not found.");

        await _dbRepo.DeletePrerequisiteRuleAsync(rule, ct);
        return Unit.Value;
    }
}
