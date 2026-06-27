using ResearchLms.Content.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Domain.Entities;

public class Walkthrough : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string TargetRoute { get; private set; } = string.Empty;
    public WalkthroughTrigger Trigger { get; private set; }
    public int Priority { get; private set; }
    public bool IsActive { get; private set; }

    private readonly List<WalkthroughStep> _steps = new();
    public IReadOnlyCollection<WalkthroughStep> Steps => _steps.AsReadOnly();

    protected Walkthrough() { }

    public Walkthrough(string name, string targetRoute, WalkthroughTrigger trigger, int priority, bool isActive)
    {
        Name = name;
        TargetRoute = targetRoute;
        Trigger = trigger;
        Priority = priority;
        IsActive = isActive;
    }

    public void Update(string name, string targetRoute, WalkthroughTrigger trigger, int priority, bool isActive)
    {
        Name = name;
        TargetRoute = targetRoute;
        Trigger = trigger;
        Priority = priority;
        IsActive = isActive;
    }

    public void AddStep(WalkthroughStep step) => _steps.Add(step);
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
