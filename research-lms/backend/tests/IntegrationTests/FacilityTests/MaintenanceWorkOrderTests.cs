using System.Net;
using System.Net.Http.Json;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.IntegrationTests.FacilityTests;

public class MaintenanceWorkOrderTests : IClassFixture<FacilityWebApplicationFactory>
{
    private readonly HttpClient _client;
    private Guid _facilityId;
    private Guid _assetId;

    public MaintenanceWorkOrderTests(FacilityWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", "00000000-0000-0000-0000-000000000001");
        factory.SeedTestDataAsync().GetAwaiter().GetResult();
    }

    private async Task EnsureAssetExists()
    {
        if (_facilityId == Guid.Empty)
        {
            var facDto = new CreateFacilityDto("Maintenance Test Lab", "Research", "Building D");
            var facResponse = await _client.PostAsJsonAsync("/api/v1/facilities", facDto);
            var facCreated = await facResponse.Content.ReadFromJsonAsync<FacilityDto>();
            _facilityId = facCreated!.Id;
        }

        if (_assetId == Guid.Empty)
        {
            var assetDto = new CreateAssetRequest(
                "Maintenance Asset", "MNT-001", "Equipment", _facilityId,
                null, null, null, null, null, null, null, "Maintenance Room", null, null, null,
                null, null, null, null, null, null, null);
            var assetResponse = await _client.PostAsJsonAsync("/api/v1/assets", assetDto);
            var assetContent = await assetResponse.Content.ReadFromJsonAsync<ApiResponse<object>>();
            _assetId = Guid.Parse(assetContent!.Data!.ToString()!);
        }
    }

    [Fact]
    public async Task CreateMaintenanceRecord_ValidRequest_ReturnsCreated()
    {
        await EnsureAssetExists();
        var dto = new CreateMaintenanceRecordRequest(
            _assetId, "Preventive", DateOnly.FromDateTime(DateTime.UtcNow),
            "Annual maintenance", null, null, "John Tech");

        var response = await _client.PostAsJsonAsync("/api/v1/maintenance", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task GetMaintenanceRecords_ReturnsList()
    {
        await EnsureAssetExists();
        var dto = new CreateMaintenanceRecordRequest(
            _assetId, "Corrective", DateOnly.FromDateTime(DateTime.UtcNow),
            "Fix sensor", null, 500, "Sarah Fix");
        await _client.PostAsJsonAsync("/api/v1/maintenance", dto);

        var response = await _client.GetAsync($"/api/v1/maintenance?assetId={_assetId}");
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<object>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(content);
        Assert.True(content!.Success);
    }

    [Fact]
    public async Task CompleteMaintenanceRecord_TransitionsStatus()
    {
        await EnsureAssetExists();
        var createDto = new CreateMaintenanceRecordRequest(
            _assetId, "Preventive", DateOnly.FromDateTime(DateTime.UtcNow),
            "Oil change", null, 200, "Mike Tech");
        var createResponse = await _client.PostAsJsonAsync("/api/v1/maintenance", createDto);
        var createContent = await createResponse.Content.ReadFromJsonAsync<ApiResponse<object>>();
        var id = Guid.Parse(createContent!.Data!.ToString()!);

        var completeDto = new CompleteMaintenanceRecordRequest(
            DateOnly.FromDateTime(DateTime.UtcNow), "Completed", 200);
        var response = await _client.PatchAsJsonAsync($"/api/v1/maintenance/{id}/complete", completeDto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
