using ResearchLms.Content.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Domain.Entities;

public class WalkthroughStep : BaseEntity
{
    public Guid WalkthroughId { get; private set; }
    public int StepOrder { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public string? ElementSelector { get; private set; }
    public WalkthroughPlacement Placement { get; private set; }
    public WalkthroughActionType ActionType { get; private set; }

    protected WalkthroughStep() { }

    public WalkthroughStep(Guid walkthroughId, int stepOrder, string title, string content, string? elementSelector, WalkthroughPlacement placement, WalkthroughActionType actionType)
    {
        WalkthroughId = walkthroughId;
        StepOrder = stepOrder;
        Title = title;
        Content = content;
        ElementSelector = elementSelector;
        Placement = placement;
        ActionType = actionType;
    }
}
