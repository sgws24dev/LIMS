namespace ResearchLms.IntegrationTests.BillingTests;

public class BillingErpTests : IClassFixture<BillingWebApplicationFactory>
{
    private readonly HttpClient _client;

    public BillingErpTests(BillingWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetErpSyncLogs_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/billing/erp-sync");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetCredits_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/billing/credits");
        response.EnsureSuccessStatusCode();
    }
}
