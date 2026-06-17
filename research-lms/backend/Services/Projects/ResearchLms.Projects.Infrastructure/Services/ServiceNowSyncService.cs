using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Infrastructure.Services;

public class ServiceNowSyncService : IIssueSyncService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ServiceNowSyncService> _logger;

    public ServiceNowSyncService(
        IConfiguration config,
        IHttpClientFactory httpClientFactory,
        ILogger<ServiceNowSyncService> logger)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public string ProviderName => "ServiceNow";

    public async Task<ExternalIssueRef> PushIssueAsync(Issue issue, CancellationToken ct = default)
    {
        var client = _httpClientFactory.CreateClient("ServiceNow");
        var table = _config["ServiceNow:IncidentTable"] ?? "incident";
        var payload = new
        {
            short_description = issue.Title,
            description = issue.Description ?? "",
            priority = MapPriority(issue.Priority),
            urgency = MapSeverity(issue.Severity),
            category = issue.Type.ToString().ToLower(),
            u_research_lms_id = issue.Id.ToString()
        };

        HttpResponseMessage response;
        if (string.IsNullOrEmpty(issue.ExternalId))
        {
            response = await client.PostAsJsonAsync($"/api/now/table/{table}", payload, ct);
        }
        else
        {
            response = await client.PutAsJsonAsync($"/api/now/table/{table}/{issue.ExternalId}", payload, ct);
        }

        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ServiceNowResponse>(cancellationToken: ct);

        return new ExternalIssueRef(
            result!.Result.SysId,
            $"{_config["ServiceNow:BaseUrl"]}/incident.do?sys_id={result.Result.SysId}",
            ProviderName);
    }

    public async Task<bool> PullIssueAsync(Issue issue, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(issue.ExternalId)) return false;

        try
        {
            var client = _httpClientFactory.CreateClient("ServiceNow");
            var table = _config["ServiceNow:IncidentTable"] ?? "incident";
            var response = await client.GetAsync(
                $"/api/now/table/{table}/{issue.ExternalId}?sysparm_fields=state,priority,short_description,description", ct);

            if (!response.IsSuccessStatusCode) return false;

            var result = await response.Content.ReadFromJsonAsync<ServiceNowResponse>(cancellationToken: ct);

            var newStatus = result!.Result.State switch
            {
                "1" => IssueStatus.Open,
                "2" => IssueStatus.InProgress,
                "6" => IssueStatus.Resolved,
                "7" => IssueStatus.Closed,
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
            _logger.LogError(ex, "ServiceNow pull failed for Issue {IssueId}", issue.Id);
            return false;
        }
    }

    public Task<IssueSyncResult> SyncProjectAsync(Guid projectId, CancellationToken ct = default)
        => throw new NotImplementedException("Use SyncProjectIssuesCommand handler instead.");

    private static string MapPriority(Priority p) => p switch
    {
        Priority.Critical => "1",
        Priority.High => "2",
        Priority.Medium => "3",
        Priority.Low => "4",
        _ => "3"
    };

    private static string MapSeverity(IssueSeverity s) => s switch
    {
        IssueSeverity.Critical => "1",
        IssueSeverity.Major => "2",
        IssueSeverity.Minor => "3",
        IssueSeverity.Enhancement => "3",
        _ => "3"
    };
}

internal record ServiceNowResponse(ServiceNowResult Result);
internal record ServiceNowResult(
    [property: JsonPropertyName("sys_id")] string SysId,
    [property: JsonPropertyName("state")] string State);
