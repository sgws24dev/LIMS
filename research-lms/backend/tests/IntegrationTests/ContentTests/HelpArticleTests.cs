using System.Net.Http.Json;

namespace ResearchLms.IntegrationTests.ContentTests;

public class HelpArticleTests : IClassFixture<ContentWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HelpArticleTests(ContentWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task SearchHelpArticles_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/content/help-articles?publishedOnly=true");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreateHelpArticle_ReturnsCreated()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/content/help-articles", new
        {
            title = "Test Article",
            content = "## Heading\nTest content",
            categoryId = Guid.Empty,
            tags = new[] { "test" },
            isPublished = true
        });
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetArticleBySlug_ReturnsOk()
    {
        await _client.PostAsJsonAsync("/api/v1/content/help-articles", new
        {
            title = "Slug Test Title",
            content = "Content",
            categoryId = Guid.Empty,
            tags = new[] { "test" },
            isPublished = true
        });

        var response = await _client.GetAsync("/api/v1/content/help-articles/slug-test-title");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task UpdateHelpArticle_ReturnsNoContent()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/v1/content/help-articles", new
        {
            title = "Update Test",
            content = "Original",
            categoryId = Guid.Empty,
            tags = new[] { "test" },
            isPublished = true
        });
        createResponse.EnsureSuccessStatusCode();

        var articlesResponse = await _client.GetAsync("/api/v1/content/help-articles?publishedOnly=true");
        var articles = await articlesResponse.Content.ReadFromJsonAsync<ApiEnvelope<HelpArticleDto[]>>();
        var id = articles!.Data!.First(a => a.Title == "Update Test").Id;

        var updateResponse = await _client.PutAsJsonAsync($"/api/v1/content/help-articles/{id}", new
        {
            title = "Update Test",
            content = "Updated Content",
            categoryId = Guid.Empty,
            tags = new[] { "test", "updated" },
            isPublished = true
        });
        Assert.Equal(System.Net.HttpStatusCode.NoContent, updateResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteHelpArticle_ReturnsNoContent()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/v1/content/help-articles", new
        {
            title = "Delete Test Article",
            content = "To be deleted",
            categoryId = Guid.Empty,
            tags = new[] { "test" },
            isPublished = true
        });
        createResponse.EnsureSuccessStatusCode();

        var articlesResponse = await _client.GetAsync("/api/v1/content/help-articles?publishedOnly=true");
        var articles = await articlesResponse.Content.ReadFromJsonAsync<ApiEnvelope<HelpArticleDto[]>>();
        var id = articles!.Data!.First(a => a.Title == "Delete Test Article").Id;

        var deleteResponse = await _client.DeleteAsync($"/api/v1/content/help-articles/{id}");
        Assert.Equal(System.Net.HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    private record HelpArticleDto(string Id, string Title, string Slug, string Content, string CategoryId, string[] Tags, bool IsPublished, int ViewCount, string CreatedAt);
}