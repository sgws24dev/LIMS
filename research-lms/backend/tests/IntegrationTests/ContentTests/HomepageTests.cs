using System.Net.Http.Json;

namespace ResearchLms.IntegrationTests.ContentTests;

public class HomepageTests : IClassFixture<ContentWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HomepageTests(ContentWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetActiveHomepage_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/content/homepage");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task SaveAndGetHomepage_ReturnsSavedLayout()
    {
        var layout = "{\"sections\":[{\"type\":\"KpiCard\",\"position\":1,\"config\":{\"metric\":\"Revenue\"}}]}";

        var saveResponse = await _client.PutAsJsonAsync("/api/v1/content/homepage", new
        {
            name = "Test Homepage",
            isActive = true,
            layoutJson = layout
        });
        Assert.Equal(System.Net.HttpStatusCode.NoContent, saveResponse.StatusCode);

        var getResponse = await _client.GetAsync("/api/v1/content/homepage");
        getResponse.EnsureSuccessStatusCode();
        var homepage = await getResponse.Content.ReadFromJsonAsync<ApiEnvelope<HomepageDto>>();
        Assert.Equal(layout, homepage!.Data!.LayoutJson);
        Assert.Equal("Test Homepage", homepage.Data.Name);
        Assert.True(homepage.Data.IsActive);
    }

    private record HomepageDto(string Id, string Name, bool IsActive, string LayoutJson);
}