using ResearchLms.Training.Domain.ValueObjects;

namespace ResearchLms.Training.Domain.Interfaces;

public interface IPrerequisiteService
{
    Task<PrerequisiteResult> ValidateAsync(Guid userId, Guid? instrumentId, CancellationToken ct);
}
