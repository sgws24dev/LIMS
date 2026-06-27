using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class AutomationRule : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public TriggerType TriggerType { get; private set; }
    public string TriggerConfig { get; private set; } = "{}";
    public AutomationActionType ActionType { get; private set; }
    public string ActionConfig { get; private set; } = "{}";
    public bool RequiresApproval { get; private set; }
    public bool IsEnabled { get; private set; }

    protected AutomationRule() { }

    public AutomationRule(string name, TriggerType triggerType, string triggerConfig,
        AutomationActionType actionType, string actionConfig, bool requiresApproval)
    {
        Name = name;
        TriggerType = triggerType;
        TriggerConfig = triggerConfig;
        ActionType = actionType;
        ActionConfig = actionConfig;
        RequiresApproval = requiresApproval;
        IsEnabled = true;
    }

    public void Update(string name, TriggerType triggerType, string triggerConfig,
        AutomationActionType actionType, string actionConfig, bool requiresApproval)
    {
        Name = name;
        TriggerType = triggerType;
        TriggerConfig = triggerConfig;
        ActionType = actionType;
        ActionConfig = actionConfig;
        RequiresApproval = requiresApproval;
    }

    public void SetEnabled(bool enabled) => IsEnabled = enabled;
}
