namespace ResearchLms.Scheduling.Domain.Exceptions;

public class DuplicateWaitlistEntryException : Exception
{
    public DuplicateWaitlistEntryException()
        : base("You already have a pending waitlist entry for this resource and time.") { }
}
