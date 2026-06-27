using System.Net.Http.Json;

namespace ResearchLms.IntegrationTests.BillingTests;

public class BillingInvoiceTests : IClassFixture<BillingWebApplicationFactory>
{
    private readonly HttpClient _client;

    public BillingInvoiceTests(BillingWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateInvoice_ThenGetById_ReturnsInvoice()
    {
        var create = await _client.PostAsJsonAsync("/api/v1/billing/invoices", new
        {
            billedToEntityType = "Manual",
            billToName = "Test Customer",
            billToAddress = "123 Test St",
            billToEmail = "test@test.com",
            currency = "USD",
            invoiceDate = DateTime.UtcNow,
            dueDate = DateTime.UtcNow.AddDays(30),
            lineItems = new[]
            {
                new { description = "Test Item", quantity = 1, unitPrice = 100m, lineTotal = 100m }
            }
        });
        create.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetDashboard_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/billing/dashboard");
        response.EnsureSuccessStatusCode();
    }
}
