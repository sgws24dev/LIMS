using MediatR;
using ResearchLms.Training.Domain.Entities;
using ResearchLms.Training.Domain.Interfaces;

namespace ResearchLms.Training.Application.Commands;

public record CreatePrerequisiteRuleCommand(
    Guid TenantId,
    Guid? InstrumentId,
    Guid CompetencyId
) : IRequest<Guid>;

public class CreatePrerequisiteRuleCommandHandler : IRequestHandler<CreatePrerequisiteRuleCommand, Guid>
{
    private readonly ICompetencyRepository _dbRepo;

    public CreatePrerequisiteRuleCommandHandler(ICompetencyRepository dbRepo)
    {
        _dbRepo = dbRepo;
    }

    public async Task<Guid> Handle(CreatePrerequisiteRuleCommand request, CancellationToken ct)
    {
        var rule = new PrerequisiteRule(request.TenantId, request.InstrumentId, request.CompetencyId);
        await _dbRepo.AddPrerequisiteRuleAsync(rule, ct);
        return rule.Id;
    }
}
