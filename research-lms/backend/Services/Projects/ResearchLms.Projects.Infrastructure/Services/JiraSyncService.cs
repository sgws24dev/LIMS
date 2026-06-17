using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Infrastructure.Services;

public class JiraSyncService : IIssueSyncService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<JiraSyncService> _logger;

    public JiraSyncService(
        IConfiguration config,
        IHttpClientFactory httpClientFactory,
        ILogger<JiraSyncService> logger)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public string ProviderName => "Jira";

    public async Task<ExternalIssueRef> PushIssueAsync(Issue issue, CancellationToken ct = default)
    {
        var client = _httpClientFactory.CreateClient("Jira");
        var projectKey = _config["Jira:ProjectKey"] ?? "LMS";

        if (string.IsNullOrEmpty(issue.ExternalId))
        {
            var payload = new
            {
                fields = new
                {
                    project = new { key = projectKey },
                    summary = issue.Title,
                    description = new
                    {
                        type = "doc",
                        version = 1,
                        content = new[]
                        {
                            new
                            {
                                type = "paragraph",
                                content = new[]
                                {
                                    new { type = "text", text = issue.Description ?? "" }
                                }
                            }
                        }
                    },
                    issuetype = new { name = MapIssueType(issue.Type) },
                    priority = new { name = issue.Priority.ToString() }
                }
            };

            var response = await client.PostAsJsonAsync("/rest/api/3/issue", payload, ct);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<JiraCreateResponse>(cancellationToken: ct);

            return new ExternalIssueRef(result!.Key, $"{_config["Jira:BaseUrl"]}/browse/{result.Key}", ProviderName);
        }
        else
        {
            var payload = new
            {
                fields = new
                {
                    summary = issue.Title,
                    priority = new { name = issue.Priority.ToString() }
                }
            };
            var response = await client.PutAsJsonAsync($"/rest/api/3/issue/{issue.ExternalId}", payload, ct);
            response.EnsureSuccessStatusCode();
            return new ExternalIssueRef(issue.ExternalId,
                issue.ExternalUrl ?? $"{_config["Jira:BaseUrl"]}/browse/{issue.ExternalId}", ProviderName);
        }
    }

    public async Task<bool> PullIssueAsync(Issue issue, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(issue.ExternalId)) return false;

        try
        {
            var client = _httpClientFactory.CreateClient("Jira");
            var response = await client.GetAsync(
                $"/rest/api/3/issue/{issue.ExternalId}?fields=status,priority,summary", ct);

            if (!response.IsSuccessStatusCode) return false;

            var result = await response.Content.ReadFromJsonAsync<JiraGetResponse>(cancellationToken: ct);

            var statusName = result!.Fields.Status.Name;
            var newStatus = statusName switch
            {
                "To Do" => IssueStatus.Open,
                "In Progress" => IssueStatus.InProgress,
                "Done" => IssueStatus.Resolved,
                "Closed" => IssueStatus.Closed,
                _ => issue.Status
            };

            if (issue.CanTransitionTo(newStatus))
            {
                issue.UpdateStatus(newStatus);
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Jira pull failed for Issue {IssueId}", issue.Id);
            return false;
        }
    }

    public Task<IssueSyncResult> SyncProjectAsync(Guid projectId, CancellationToken ct = default)
        => throw new NotImplementedException();

    private static string MapIssueType(IssueType t) => t switch
    {
        IssueType.Bug => "Bug",
        IssueType.Feature => "Story",
        IssueType.Support => "Task",
        IssueType.Documentation => "Task",
        _ => "Task"
    };
}

internal record JiraCreateResponse(string Key, string Id);
internal record JiraGetResponse(JiraFields Fields);
internal record JiraFields(JiraStatus Status, JiraPriority Priority, string Summary);
internal record JiraStatus(string Name);
internal record JiraPriority(string Name);
