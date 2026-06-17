namespace ResearchLms.ServiceWorkflow.Domain.ValueObjects;

public record TransitionTrigger(string Name, string Label)
{
    public static TransitionTrigger Submit => new("submit", "Submit");
    public static TransitionTrigger Approve => new("approve", "Approve");
    public static TransitionTrigger Reject => new("reject", "Reject");
    public static TransitionTrigger Cancel => new("cancel", "Cancel");
    public static TransitionTrigger Revise => new("revise", "Revise");
}
