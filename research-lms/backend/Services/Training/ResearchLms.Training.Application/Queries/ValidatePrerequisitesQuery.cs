using MediatR;
using ResearchLms.Training.Domain.Interfaces;
using ResearchLms.Training.Domain.ValueObjects;

namespace ResearchLms.Training.Application.Queries;

public record ValidatePrerequisitesQuery(
    Guid UserId,
    Guid InstrumentId
) : IRequest<PrerequisiteResult>;

public class ValidatePrerequisitesQueryHandler : IRequestHandler<ValidatePrerequisitesQuery, PrerequisiteResult>
{
    private readonly IPrerequisiteService _prerequisiteService;

    public ValidatePrerequisitesQueryHandler(IPrerequisiteService prerequisiteService)
    {
        _prerequisiteService = prerequisiteService;
    }

    public async Task<PrerequisiteResult> Handle(ValidatePrerequisitesQuery request, CancellationToken ct)
    {
        return await _prerequisiteService.ValidateAsync(request.UserId, request.InstrumentId, ct);
    }
}
