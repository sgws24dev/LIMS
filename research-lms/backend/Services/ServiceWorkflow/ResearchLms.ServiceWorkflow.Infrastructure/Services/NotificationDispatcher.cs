using System.Text.RegularExpressions;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;
using ResearchLms.ServiceWorkflow.Infrastructure.Persistence;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services;

public class NotificationDispatcher : INotificationDispatcher
{
    private readonly ServiceWorkflowDbContext _context;
    private readonly ISmtpEmailService _emailService;
    private readonly ILogger<NotificationDispatcher> _logger;

    public NotificationDispatcher(
        ServiceWorkflowDbContext context,
        ISmtpEmailService emailService,
        ILogger<NotificationDispatcher> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task TryDispatchAsync(
        Guid workflowDefinitionId,
        string stateName,
        WorkflowInstance instance,
        CancellationToken ct = default)
    {
        try
        {
            var rules = await _context.NotificationRules
                .Where(r => r.WorkflowDefinitionId == workflowDefinitionId &&
                            r.Trigger == stateName &&
                            !r.IsDeleted)
                .ToListAsync(ct);

            foreach (var rule in rules)
            {
                if (rule.Channel == NotificationChannel.Email)
                    await DispatchEmailRuleAsync(rule, instance, ct);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to dispatch notifications for workflow {Id} at state {State}",
                instance.Id, stateName);
        }
    }

    private async Task DispatchEmailRuleAsync(
        NotificationRule rule,
        WorkflowInstance instance,
        CancellationToken ct)
    {
        var recipients = DeserializeRecipients(rule.Recipients);
        var toEmails = ResolveRecipientEmails(recipients, instance);
        if (toEmails.Count == 0)
        {
            _logger.LogWarning("No resolved recipients for notification rule {RuleId}", rule.Id);
            return;
        }

        var variables = new Dictionary<string, string>
        {
            ["EntityId"] = instance.EntityId.ToString(),
            ["EntityType"] = instance.EntityType,
            ["CurrentState"] = instance.CurrentState,
            ["SubmittedById"] = instance.CreatedBy
        };

        var subject = ReplaceTokens(rule.Subject, variables);
        var body = ReplaceTokens(rule.Body, variables);

        await _emailService.SendAsync(new EmailMessage(
            To: toEmails,
            Subject: subject,
            Body: body
        ), ct);
    }

    private static List<string> ResolveRecipientEmails(
        IReadOnlyList<RecipientSpec> specs,
        WorkflowInstance instance)
    {
        var emails = new List<string>();

        foreach (var spec in specs)
        {
            if (spec.Type == "Static" && !string.IsNullOrWhiteSpace(spec.Value))
                emails.Add(spec.Value);
            else if (spec.Type == "Dynamic" && spec.Value == "SubmittedBy")
            {
                var userEmail = $"{instance.CreatedBy}@researchlms.local";
                emails.Add(userEmail);
            }
        }

        return emails;
    }

    private static string ReplaceTokens(string text, Dictionary<string, string> variables)
        => Regex.Replace(text, @"\{\{(\w+)\}\}", match =>
        {
            var key = match.Groups[1].Value;
            return variables.TryGetValue(key, out var value) ? value : match.Value;
        });

    private static IReadOnlyList<RecipientSpec> DeserializeRecipients(string json)
        => JsonSerializer.Deserialize<List<RecipientSpec>>(json)
           ?? new List<RecipientSpec>();
}
