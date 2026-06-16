using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.ValueObjects;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public interface IConstraintEvaluationService
{
    Task<ConstraintEvaluationResult> EvaluateAsync(
        Guid resourceId,
        Guid userId,
        TimeSlot slot,
        CancellationToken ct);
}

public record ConstraintEvaluationResult(
    bool IsSatisfied,
    IEnumerable<ConstraintViolation> Violations
);

public record ConstraintViolation(
    ConstraintType Type,
    string Value,
    string Message
);
