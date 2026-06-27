using System.Net.Http.Json;

namespace ResearchLms.IntegrationTests.ContentTests;

public class WalkthroughTests : IClassFixture<ContentWebApplicationFactory>
{
    private readonly HttpClient _client;

    public WalkthroughTests(ContentWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetActiveWalkthroughs_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/content/walkthroughs/active?route=/dashboard");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreateAndCompleteWalkthrough_ReturnsNoContent()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/v1/content/walkthroughs", new
        {
            name = "Test Walkthrough",
            targetRoute = "/test-route",
            trigger = "Manual",
            priority = 1,
            isActive = true,
            steps = new[]
            {
                new { stepOrder = 1, title = "Step 1", content = "Do step 1", elementSelector = "#test", placement = "Bottom", actionType = "Click" },
                new { stepOrder = 2, title = "Step 2", content = "Do step 2", elementSelector = (string?)null, placement = "Top", actionType = "Wait" }
            }
        });
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<ApiEnvelope<string>>();

        var completeResponse = await _client.PostAsync($"/api/v1/content/walkthroughs/{created!.Data}/complete", null);
        Assert.Equal(System.Net.HttpStatusCode.NoContent, completeResponse.StatusCode);
    }

    [Fact]
    public async Task SkipWalkthrough_ReturnsNoContent()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/v1/content/walkthroughs", new
        {
            name = "Skip Test",
            targetRoute = "/skip-route",
            trigger = "Manual",
            priority = 1,
            isActive = true,
            steps = new[]
            {
                new { stepOrder = 1, title = "Step 1", content = "Content", elementSelector = (string?)null, placement = "Top", actionType = "Wait" }
            }
        });
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<ApiEnvelope<string>>();

        var skipResponse = await _client.PostAsync($"/api/v1/content/walkthroughs/{created!.Data}/skip", null);
        Assert.Equal(System.Net.HttpStatusCode.NoContent, skipResponse.StatusCode);
    }

    [Fact]
    public async Task SaveAndGetWalkthroughProgress_ReturnsProgress()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/v1/content/walkthroughs", new
        {
            name = "Progress Test",
            targetRoute = "/progress-route",
            trigger = "Manual",
            priority = 1,
            isActive = true,
            steps = new[]
            {
                new { stepOrder = 1, title = "S1", content = "C1", elementSelector = (string?)null, placement = "Top", actionType = "Wait" },
                new { stepOrder = 2, title = "S2", content = "C2", elementSelector = (string?)null, placement = "Top", actionType = "Wait" }
            }
        });
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<ApiEnvelope<string>>();

        var progressResponse = await _client.PostAsJsonAsync($"/api/v1/content/walkthroughs/{created!.Data}/progress", new { currentStepIndex = 1 });
        Assert.Equal(System.Net.HttpStatusCode.NoContent, progressResponse.StatusCode);

        var getProgressResponse = await _client.GetAsync($"/api/v1/content/walkthroughs/{created.Data}/progress");
        getProgressResponse.EnsureSuccessStatusCode();

        var progress = await getProgressResponse.Content.ReadFromJsonAsync<ApiEnvelope<WalkthroughProgressDto>>();
        Assert.Equal(1, progress!.Data!.CurrentStepIndex);
        Assert.Equal("InProgress", progress.Data.Status);
    }

    private record WalkthroughProgressDto(string WalkthroughId, int? CurrentStepIndex, string Status);
}