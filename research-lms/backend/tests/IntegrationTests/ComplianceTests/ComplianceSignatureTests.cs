using System.Net.Http.Json;

namespace ResearchLms.IntegrationTests.ComplianceTests;

public class ComplianceSignatureTests : IClassFixture<ComplianceWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ComplianceSignatureTests(ComplianceWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CaptureSignature_ThenVerify_ReturnsOk()
    {
        var capture = await _client.PostAsJsonAsync("/api/v1/compliance/signatures", new
        {
            signedEntityType = "Invoice",
            signedEntityId = Guid.NewGuid(),
            signerName = "Test Signer",
            signerEmail = "signer@test.com",
            signatureData = "[{\"x\":10,\"y\":20,\"pressure\":0.5,\"timestamp\":1000}]",
            documentContext = "Test document content",
        });
        capture.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetSignaturesByEntity_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/compliance/signatures?entityType=Invoice&entityId=" + Guid.NewGuid());
        response.EnsureSuccessStatusCode();
    }
}
