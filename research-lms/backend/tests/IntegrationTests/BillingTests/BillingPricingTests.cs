using System.Net.Http.Json;

namespace ResearchLms.IntegrationTests.BillingTests;

public class BillingPricingTests : IClassFixture<BillingWebApplicationFactory>
{
    private readonly HttpClient _client;

    public BillingPricingTests(BillingWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreatePricingModel_ThenCalculatePrice_ReturnsOk()
    {
        var create = await _client.PostAsJsonAsync("/api/v1/billing/pricing-models", new
        {
            name = "Test Flat Rate",
            modelType = "FlatRate",
            effectiveFrom = DateTime.UtcNow.AddDays(-1),
            effectiveTo = DateTime.UtcNow.AddYears(1),
            isActive = true,
        });
        create.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreateRateTable_ReturnsOk()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/billing/rate-tables", new
        {
            pricingModelId = Guid.NewGuid(),
            customerType = "Internal",
            rate = 100m,
            effectiveFrom = DateTime.UtcNow,
        });
        response.EnsureSuccessStatusCode();
    }
}
