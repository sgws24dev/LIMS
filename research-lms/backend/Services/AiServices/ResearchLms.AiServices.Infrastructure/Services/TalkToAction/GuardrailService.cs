using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Infrastructure.Services.TalkToAction;

public class GuardrailService : IGuardrailService
{
    private static readonly HashSet<string> DangerousIntents = new(StringComparer.OrdinalIgnoreCase)
    {
        "DeleteInstrument", "ModifyCalibration", "OverrideLockout", "BypassQc", "DeleteUser"
    };

    private static readonly HashSet<string> ApprovalRequiredIntents = new(StringComparer.OrdinalIgnoreCase)
    {
        "BookInstrument", "ModifySchedule", "DeactivateUser"
    };

    public Task<GuardrailResult> EvaluateAsync(ActionPlan plan, Guid userId, CancellationToken ct = default)
    {
        if (DangerousIntents.Contains(plan.Intent))
        {
            return Task.FromResult(new GuardrailResult(
                false,
                $"Action '{plan.Intent}' is blocked: potentially dangerous operation.",
                false,
                Array.Empty<string>()
            ));
        }

        if (ApprovalRequiredIntents.Contains(plan.Intent) || plan.RequiresApproval)
        {
            return Task.FromResult(new GuardrailResult(
                true,
                null,
                true,
                new[] { "LabManager", "Admin" }
            ));
        }

        return Task.FromResult(new GuardrailResult(true, null, false, Array.Empty<string>()));
    }
}
