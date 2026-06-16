using System.Net;
using System.Net.Http.Json;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.IntegrationTests.FacilityTests;

public class AssetLifecycleTests : IClassFixture<FacilityWebApplicationFactory>
{
    private readonly HttpClient _client;
    private Guid _facilityId;

    public AssetLifecycleTests(FacilityWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", "00000000-0000-0000-0000-000000000001");
        factory.SeedTestDataAsync().GetAwaiter().GetResult();
    }

    private async Task EnsureFacilityExists()
    {
        if (_facilityId == Guid.Empty)
        {
            var dto = new CreateFacilityDto("Asset Test Lab", "Research", "Building B");
            var response = await _client.PostAsJsonAsync("/api/v1/facilities", dto);
            var created = await response.Content.ReadFromJsonAsync<FacilityDto>();
            _facilityId = created!.Id;
        }
    }

    [Fact]
    public async Task CreateAsset_ValidRequest_ReturnsCreated()
    {
        await EnsureFacilityExists();
        var dto = new CreateAssetRequest(
            "Test Centrifuge", "AST-001", "Equipment", _facilityId,
            "X200", "TestCorp", DateOnly.FromDateTime(DateTime.UtcNow),
            10000, 1000, 10, "StraightLine", "Lab A", null, null, null,
            null, null, null, null, null, null, null);

        var response = await _client.PostAsJsonAsync("/api/v1/assets", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateInstrument_ValidRequest_ReturnsCreated()
    {
        await EnsureFacilityExists();
        var dto = new CreateAssetRequest(
            "pH Meter Pro", "INST-001", "Instruments", _facilityId,
            "P100", "TestCorp", DateOnly.FromDateTime(DateTime.UtcNow),
            5000, 500, 5, "StraightLine", "Lab A", null, null, null,
            "192.168.1.100", 8080, "HTTP", "v1.0", null, null, null, true);

        var response = await _client.PostAsJsonAsync("/api/v1/assets", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task UpdateAsset_ChangesReflectedInGetById()
    {
        await EnsureFacilityExists();
        var createDto = new CreateAssetRequest(
            "Old Name", "AST-002", "Equipment", _facilityId,
            null, null, null, null, null, null, null, "Lab A", null, null, null,
            null, null, null, null, null, null, null);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/assets", createDto);
        var createContent = await createResponse.Content.ReadFromJsonAsync<ApiResponse<object>>();
        var id = Guid.Parse(createContent!.Data!.ToString()!);

        var updateDto = new UpdateAssetRequest(
            "New Name", null, null, null, null, null, null, null, "Lab B", null, null, null,
            null, null, null, null, null, null, null);
        var updateResponse = await _client.PutAsJsonAsync($"/api/v1/assets/{id}", updateDto);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/v1/assets/{id}");
        var getContent = await getResponse.Content.ReadFromJsonAsync<ApiResponse<AssetDetailDto>>();
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.Equal("New Name", getContent!.Data!.Name);
        Assert.Equal("Lab B", getContent.Data.Location);
    }

    [Fact]
    public async Task DecommissionAsset_StatusTransitionCorrect()
    {
        await EnsureFacilityExists();
        var createDto = new CreateAssetRequest(
            "Decommission Asset", "AST-003", "Equipment", _facilityId,
            null, null, null, null, null, null, null, "Lab A", null, null, null,
            null, null, null, null, null, null, null);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/assets", createDto);
        var createContent = await createResponse.Content.ReadFromJsonAsync<ApiResponse<object>>();
        var id = Guid.Parse(createContent!.Data!.ToString()!);

        var decommBody = new { reason = "End of life" };
        var decommResponse = await _client.PatchAsJsonAsync($"/api/v1/assets/{id}/decommission", decommBody);
        Assert.Equal(HttpStatusCode.OK, decommResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/v1/assets/{id}");
        var getContent = await getResponse.Content.ReadFromJsonAsync<ApiResponse<AssetDetailDto>>();
        Assert.Equal("Decommissioned", getContent!.Data!.Status);
    }

    [Fact]
    public async Task SearchAssets_ByTextQuery_ReturnsMatchingResults()
    {
        await EnsureFacilityExists();
        var dto = new CreateAssetRequest(
            "Searchable Asset", "AST-SRCH", "Equipment", _facilityId,
            null, null, null, null, null, null, null, "Lab A", null, null, null,
            null, null, null, null, null, null, null);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/assets", dto);
        var createContent = await createResponse.Content.ReadFromJsonAsync<ApiResponse<object>>();
        var id = Guid.Parse(createContent!.Data!.ToString()!);

        var response = await _client.GetAsync("/api/v1/assets/search?q=Searchable");
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<object>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(content);
        Assert.True(content!.Success);
    }
}
