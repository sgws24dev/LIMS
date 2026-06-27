using System.Net.Http.Json;

namespace ResearchLms.IntegrationTests.ComplianceTests;

public class ComplianceHashChainTests : IClassFixture<ComplianceWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ComplianceHashChainTests(ComplianceWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task VerifyEmptyChain_ReturnsIntact()
    {
        var response = await _client.GetAsync("/api/v1/compliance/audit-logs/verify-chain");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<HashChainVerificationDto>();
        Assert.NotNull(result);
        Assert.True(result.IsIntact);
    }

    [Fact]
    public async Task GetAuditLogById_NotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/v1/compliance/audit-logs/" + Guid.NewGuid());
        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    public class HashChainVerificationDto
    {
        public bool IsIntact { get; set; }
        public string? TamperedEntryId { get; set; }
        public string? ComputedHash { get; set; }
        public string? StoredHash { get; set; }
    }
}
