using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class GuardrailConfig : BaseEntity
{
    public string ActionType { get; private set; } = string.Empty;
    public bool IsBlocked { get; private set; }
    public bool RequiresApproval { get; private set; }
    public string ApproverRolesJson { get; private set; } = "[]";
    public int MaxRatePerMinute { get; private set; }

    protected GuardrailConfig() { }

    public GuardrailConfig(string actionType, bool isBlocked, bool requiresApproval,
        string[] approverRoles, int maxRatePerMinute = 0)
    {
        ActionType = actionType;
        IsBlocked = isBlocked;
        RequiresApproval = requiresApproval;
        ApproverRolesJson = System.Text.Json.JsonSerializer.Serialize(approverRoles);
        MaxRatePerMinute = maxRatePerMinute;
    }

    public string[] GetApproverRoles()
    {
        return System.Text.Json.JsonSerializer.Deserialize<string[]>(ApproverRolesJson) ?? Array.Empty<string>();
    }
}
