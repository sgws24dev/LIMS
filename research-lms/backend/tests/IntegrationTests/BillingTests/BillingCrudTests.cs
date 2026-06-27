using FluentAssertions;
using ResearchLms.Billing.Application.DTOs;
using System.Net.Http.Json;

namespace ResearchLms.IntegrationTests.BillingTests;

public class BillingCrudTests : IClassFixture<BillingWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly BillingWebApplicationFactory _factory;

    public BillingCrudTests(BillingWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetInvoices_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/billing/invoices");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetPricingModels_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/billing/pricing-models");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetRebates_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/billing/rebates");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetTaxCodes_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/billing/tax-codes");
        response.EnsureSuccessStatusCode();
    }
}
