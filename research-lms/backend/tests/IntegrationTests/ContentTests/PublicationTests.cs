using System.Net.Http.Json;

namespace ResearchLms.IntegrationTests.ContentTests;

public class PublicationTests : IClassFixture<ContentWebApplicationFactory>
{
    private readonly HttpClient _client;

    public PublicationTests(ContentWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task SearchPublications_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/content/publications");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreatePublication_ReturnsCreated()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/content/publications", new
        {
            title = "Test Publication",
            authors = new[] { "Author One", "Author Two" },
            journal = "Test Journal",
            doi = "10.1000/test",
            type = "ResearchPaper",
            isVerified = true,
            instrumentIds = (string[]?)null
        });
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetPublicationById_ReturnsOk()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/v1/content/publications", new
        {
            title = "Find Me Publication",
            authors = new[] { "Author" },
            type = "Conference",
            isVerified = false,
            instrumentIds = (string[]?)null
        });
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<ApiEnvelope<string>>();

        var getResponse = await _client.GetAsync($"/api/v1/content/publications/{created!.Data}");
        getResponse.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task UpdatePublication_ReturnsNoContent()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/v1/content/publications", new
        {
            title = "Update Pub",
            authors = new[] { "Original Author" },
            type = "Poster",
            isVerified = false,
            instrumentIds = (string[]?)null
        });
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<ApiEnvelope<string>>();

        var updateResponse = await _client.PutAsJsonAsync($"/api/v1/content/publications/{created!.Data}", new
        {
            title = "Updated Pub Title",
            authors = new[] { "Updated Author" },
            type = "Poster",
            isVerified = true,
            instrumentIds = (string[]?)null
        });
        Assert.Equal(System.Net.HttpStatusCode.NoContent, updateResponse.StatusCode);
    }

    [Fact]
    public async Task DeletePublication_ReturnsNoContent()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/v1/content/publications", new
        {
            title = "Delete Pub",
            authors = new[] { "Author" },
            type = "Thesis",
            isVerified = false,
            instrumentIds = (string[]?)null
        });
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<ApiEnvelope<string>>();

        var deleteResponse = await _client.DeleteAsync($"/api/v1/content/publications/{created!.Data}");
        Assert.Equal(System.Net.HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task DeletePublication_MakesGetReturnNotFound()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/v1/content/publications", new
        {
            title = "Gone Pub",
            authors = new[] { "Author" },
            type = "ResearchPaper",
            isVerified = false,
            instrumentIds = (string[]?)null
        });
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<ApiEnvelope<string>>();

        await _client.DeleteAsync($"/api/v1/content/publications/{created!.Data}");

        var getResponse = await _client.GetAsync($"/api/v1/content/publications/{created.Data}");
        Assert.Equal(System.Net.HttpStatusCode.NotFound, getResponse.StatusCode);
    }
}