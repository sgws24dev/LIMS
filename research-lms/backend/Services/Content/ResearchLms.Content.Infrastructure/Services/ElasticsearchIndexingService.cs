using ResearchLms.Content.Application.Services;
using ResearchLms.Content.Domain.Entities;
using System.Text;
using System.Text.Json;

namespace ResearchLms.Content.Infrastructure.Services;

public class ElasticsearchIndexingService : IElasticsearchIndexingService
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public ElasticsearchIndexingService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task IndexHelpArticleAsync(HelpArticle article, CancellationToken ct)
    {
        var action = JsonSerializer.Serialize(new { index = new { _index = "help_articles", _id = article.Id.ToString() } }, JsonOpts);
        var doc = JsonSerializer.Serialize(new
        {
            title = article.Title,
            slug = article.Slug,
            content = article.Content,
            categoryId = article.CategoryId.ToString(),
            tags = article.GetTags(),
            isPublished = article.IsPublished,
            tenantId = article.TenantId.ToString()
        }, JsonOpts);

        var ndjson = $"{action}\n{doc}\n";

        using var response = await _httpClient.PostAsync(
            "/_bulk",
            new StringContent(ndjson, Encoding.UTF8, "application/x-ndjson"),
            ct);
        response.EnsureSuccessStatusCode();
    }

    public async Task RemoveHelpArticleAsync(Guid id, CancellationToken ct)
    {
        using var response = await _httpClient.DeleteAsync(
            $"/help_articles/_doc/{id}", ct);
        response.EnsureSuccessStatusCode();
    }
}