using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services.Actions;

public class SendApprovalEmailAction : IWorkflowAction
{
    private readonly ISmtpEmailService _emailService;

    public SendApprovalEmailAction(ISmtpEmailService emailService)
    {
        _emailService = emailService;
    }

    public string Name => "SendApprovalEmail";

    public async Task ExecuteAsync(
        WorkflowInstance instance,
        StateTransitionRecord transition,
        Dictionary<string, object> context,
        CancellationToken ct = default)
    {
        var toEmail = "approver@researchlms.local";
        if (context.TryGetValue("ApproverEmail", out var email))
            toEmail = email?.ToString() ?? toEmail;

        var title = "Service Request";
        if (context.TryGetValue("RequestTitle", out var t))
            title = t?.ToString() ?? title;

        await _emailService.SendAsync(new EmailMessage(
            To: new[] { toEmail },
            Subject: $"Action Required: Approve \"{title}\"",
            Body: $"Dear Approver,\n\nYou have a pending approval for request \"{title}\".\nPlease review and take action in ResearchLMS."
        ), ct);
    }
}
