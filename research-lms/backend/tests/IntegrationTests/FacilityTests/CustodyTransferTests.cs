using System.Net;
using System.Net.Http.Json;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.IntegrationTests.FacilityTests;

public class CustodyTransferTests : IClassFixture<FacilityWebApplicationFactory>
{
    private readonly HttpClient _client;
    private Guid _facilityId;
    private Guid _assetId;

    public CustodyTransferTests(FacilityWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", "00000000-0000-0000-0000-000000000001");
        factory.SeedTestDataAsync().GetAwaiter().GetResult();
    }

    private async Task EnsureAssetExists()
    {
        if (_facilityId == Guid.Empty)
        {
            var facDto = new CreateFacilityDto("Custody Test Lab", "Research", "Building C");
            var facResponse = await _client.PostAsJsonAsync("/api/v1/facilities", facDto);
            var facCreated = await facResponse.Content.ReadFromJsonAsync<FacilityDto>();
            _facilityId = facCreated!.Id;
        }

        if (_assetId == Guid.Empty)
        {
            var assetDto = new CreateAssetRequest(
                "Custody Asset", "CST-001", "Equipment", _facilityId,
                null, null, null, null, null, null, null, "Storage Room", null, null, null,
                null, null, null, null, null, null, null);
            var assetResponse = await _client.PostAsJsonAsync("/api/v1/assets", assetDto);
            var assetContent = await assetResponse.Content.ReadFromJsonAsync<ApiResponse<object>>();
            _assetId = Guid.Parse(assetContent!.Data!.ToString()!);
        }
    }

    [Fact]
    public async Task TransferAsset_ValidRequest_ReturnsCreated()
    {
        await EnsureAssetExists();
        var dto = new TransferAssetCustodyRequest(
            _assetId, "user-002", "Jane Smith", "Lab B",
            "New assignment", null, null);

        var response = await _client.PostAsJsonAsync("/api/v1/custody/transfer", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task GetCustodyChain_ReturnsOrderedHistory()
    {
        await EnsureAssetExists();
        var dto = new TransferAssetCustodyRequest(
            _assetId, "user-002", "Jane Smith", "Lab B",
            "Initial", null, null);
        await _client.PostAsJsonAsync("/api/v1/custody/transfer", dto);

        var response = await _client.GetAsync($"/api/v1/custody/assets/{_assetId}");
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<object>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(content);
        Assert.True(content!.Success);
    }

    [Fact]
    public async Task GetCurrentCustodian_ReturnsLatestEvent()
    {
        await EnsureAssetExists();
        var dto = new TransferAssetCustodyRequest(
            _assetId, "user-003", "Bob Wilson", "Lab C",
            "Transfer test", null, null);
        await _client.PostAsJsonAsync("/api/v1/custody/transfer", dto);

        var response = await _client.GetAsync($"/api/v1/custody/assets/{_assetId}/current");
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<CustodyEventDto>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(content);
        Assert.True(content!.Success);
        Assert.NotNull(content.Data);
        Assert.Equal("Bob Wilson", content.Data!.ToUserName);
    }

    [Fact]
    public async Task TransferAsset_WithSignatureData_StoresSignature()
    {
        await EnsureAssetExists();
        var dto = new TransferAssetCustodyRequest(
            _assetId, "user-005", "Charlie Davis", "Lab E",
            "Signature test", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", null);

        var response = await _client.PostAsJsonAsync("/api/v1/custody/transfer", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}
