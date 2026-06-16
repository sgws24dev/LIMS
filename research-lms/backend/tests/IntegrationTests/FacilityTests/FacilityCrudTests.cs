using System.Net;
using System.Net.Http.Json;
using ResearchLms.Facilities.Application.DTOs;

namespace ResearchLms.IntegrationTests.FacilityTests;

public class FacilityCrudTests : IClassFixture<FacilityWebApplicationFactory>
{
    private readonly HttpClient _client;

    public FacilityCrudTests(FacilityWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", "00000000-0000-0000-0000-000000000001");
        factory.SeedTestDataAsync().GetAwaiter().GetResult();
    }

    [Fact]
    public async Task CreateFacility_ValidRequest_ReturnsCreated()
    {
        var dto = new CreateFacilityDto("Test Lab", "Research", "Building A");

        var response = await _client.PostAsJsonAsync("/api/v1/facilities", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task GetFacilities_ReturnsList()
    {
        var createDto = new CreateFacilityDto("List Lab", "Research", "Building B");
        await _client.PostAsJsonAsync("/api/v1/facilities", createDto);

        var response = await _client.GetAsync("/api/v1/facilities");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetFacilityById_ValidId_ReturnsFacility()
    {
        var createDto = new CreateFacilityDto("Specific Lab", "Research", "Room 101");
        var createResponse = await _client.PostAsJsonAsync("/api/v1/facilities", createDto);
        var created = await createResponse.Content.ReadFromJsonAsync<FacilityDto>();
        var id = created!.Id;

        var response = await _client.GetAsync($"/api/v1/facilities/{id}");
        var facility = await response.Content.ReadFromJsonAsync<FacilityDto>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(facility);
        Assert.Equal("Specific Lab", facility!.Name);
    }

    [Fact]
    public async Task UpdateFacility_ValidRequest_ReturnsOk()
    {
        var createDto = new CreateFacilityDto("Update Lab", "Research", "Room 1");
        var createResponse = await _client.PostAsJsonAsync("/api/v1/facilities", createDto);
        var created = await createResponse.Content.ReadFromJsonAsync<FacilityDto>();
        var id = created!.Id;

        var updateDto = new UpdateFacilityDto("Updated Lab", "Research", "Room 2", true);
        var response = await _client.PutAsJsonAsync($"/api/v1/facilities/{id}", updateDto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task DeleteFacility_ReturnsNoContent()
    {
        var createDto = new CreateFacilityDto("Delete Lab", "Research", "Room 3");
        var createResponse = await _client.PostAsJsonAsync("/api/v1/facilities", createDto);
        var created = await createResponse.Content.ReadFromJsonAsync<FacilityDto>();
        var id = created!.Id;

        var response = await _client.DeleteAsync($"/api/v1/facilities/{id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
