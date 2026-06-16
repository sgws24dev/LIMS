using System.Net;
using System.Net.Http.Json;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.IntegrationTests.FacilityTests;

public class QrCodeTests : IClassFixture<FacilityWebApplicationFactory>
{
    private readonly HttpClient _client;
    private Guid _facilityId;
    private Guid _assetId;

    public QrCodeTests(FacilityWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", "00000000-0000-0000-0000-000000000001");
        factory.SeedTestDataAsync().GetAwaiter().GetResult();
    }

    private async Task EnsureAssetExists()
    {
        if (_facilityId == Guid.Empty)
        {
            var facDto = new CreateFacilityDto("QR Test Lab", "Research", "Building E");
            var facResponse = await _client.PostAsJsonAsync("/api/v1/facilities", facDto);
            var facCreated = await facResponse.Content.ReadFromJsonAsync<FacilityDto>();
            _facilityId = facCreated!.Id;
        }

        if (_assetId == Guid.Empty)
        {
            var assetDto = new CreateAssetRequest(
                "QR Asset", "QR-001", "Equipment", _facilityId,
                null, null, null, null, null, null, null, "QR Room", null, null, null,
                null, null, null, null, null, null, null);
            var assetResponse = await _client.PostAsJsonAsync("/api/v1/assets", assetDto);
            var assetContent = await assetResponse.Content.ReadFromJsonAsync<ApiResponse<object>>();
            _assetId = Guid.Parse(assetContent!.Data!.ToString()!);
        }
    }

    [Fact]
    public async Task GetAssetQr_Returns200_WithPngContentType()
    {
        await EnsureAssetExists();

        var response = await _client.GetAsync($"/api/v1/assets/{_assetId}/qr");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("image/png", response.Content.Headers.ContentType?.MediaType);
        Assert.True(response.Content.Headers.ContentLength > 0);
    }

    [Fact]
    public async Task GetAssetQr_LabelMode_ReturnsPng()
    {
        await EnsureAssetExists();

        var response = await _client.GetAsync($"/api/v1/assets/{_assetId}/qr?label=true");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("image/png", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task GetAssetQr_NonExistentAsset_Returns404()
    {
        var response = await _client.GetAsync($"/api/v1/assets/{Guid.NewGuid()}/qr");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
