using FluentAssertions;
using System.Net.Http.Json;

namespace ResearchLms.IntegrationTests.ComplianceTests;

public class ComplianceAuditTests : IClassFixture<ComplianceWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ComplianceAuditTests(ComplianceWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAuditLogs_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/compliance/audit-logs");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task VerifyAuditChain_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/compliance/audit-logs/verify-chain");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetChangeHistory_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/compliance/change-history?entityType=Test&entityId=" + Guid.NewGuid());
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task ExportAuditLogs_ReturnsCsv()
    {
        var response = await _client.GetAsync("/api/v1/compliance/audit-logs/export");
        response.EnsureSuccessStatusCode();
        response.Content.Headers.ContentType?.MediaType.Should().Be("text/csv");
    }
}
