using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Domain.Exceptions;

public class ConstraintViolationException : Exception
{
    public IEnumerable<ConstraintViolation> Violations { get; }

    public ConstraintViolationException(IEnumerable<ConstraintViolation> violations)
        : base("Booking constraints not satisfied.")
    {
        Violations = violations;
    }
}
