using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using ResearchLms.Identity.Application.DTOs;

namespace ResearchLms.IntegrationTests;

public class RoleTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public RoleTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        factory.SeedTestDataAsync().GetAwaiter().GetResult();
    }

    private async Task AuthenticateAsync()
    {
        var login = new LoginRequest("admin@researchlms.com", "Admin@123!");
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", login);
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", result!.AccessToken);
    }

    [Fact]
    public async Task GetRoles_WhenAuthenticated_ReturnsOk()
    {
        await AuthenticateAsync();

        var response = await _client.GetAsync("/api/v1/roles");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var roles = await response.Content.ReadFromJsonAsync<List<RoleDto>>();
        Assert.NotNull(roles);
        Assert.NotEmpty(roles);
    }

    [Fact]
    public async Task GetRoles_WhenNotAuthenticated_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/v1/roles");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetRoleById_WithValidId_ReturnsRole()
    {
        await AuthenticateAsync();

        var allResponse = await _client.GetAsync("/api/v1/roles");
        var allRoles = await allResponse.Content.ReadFromJsonAsync<List<RoleDto>>();
        var firstRoleId = allRoles![0].Id;

        var response = await _client.GetAsync($"/api/v1/roles/{firstRoleId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var role = await response.Content.ReadFromJsonAsync<RoleDto>();
        Assert.NotNull(role);
        Assert.Equal(firstRoleId, role!.Id);
    }

    [Fact]
    public async Task CreateRole_WithValidData_ReturnsOk()
    {
        await AuthenticateAsync();

        var dto = new CreateRoleDto(
            "Test Role",
            "A test role",
            [new PermissionDto("test_module", true, true, false, false)]);

        var response = await _client.PostAsJsonAsync("/api/v1/roles", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var role = await response.Content.ReadFromJsonAsync<RoleDto>();
        Assert.NotNull(role);
        Assert.Equal("Test Role", role!.Name);
    }

    [Fact]
    public async Task UpdateRole_WithValidData_ReturnsOk()
    {
        await AuthenticateAsync();

        var allResponse = await _client.GetAsync("/api/v1/roles");
        var allRoles = await allResponse.Content.ReadFromJsonAsync<List<RoleDto>>();
        var firstRoleId = allRoles![0].Id;

        var dto = new UpdateRoleDto(
            "Updated Role",
            "Updated description",
            [new PermissionDto("updated_module", true, false, false, false)]);

        var response = await _client.PutAsJsonAsync($"/api/v1/roles/{firstRoleId}", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var role = await response.Content.ReadFromJsonAsync<RoleDto>();
        Assert.NotNull(role);
        Assert.Equal("Updated Role", role!.Name);
    }

    [Fact]
    public async Task DeleteRole_WithValidId_ReturnsNoContent()
    {
        await AuthenticateAsync();

        var dto = new CreateRoleDto(
            "Delete Me Role",
            "This role will be deleted",
            [new PermissionDto("temp", true, false, false, false)]);

        var createResponse = await _client.PostAsJsonAsync("/api/v1/roles", dto);
        var created = await createResponse.Content.ReadFromJsonAsync<RoleDto>();

        var response = await _client.DeleteAsync($"/api/v1/roles/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeleteSystemRole_ReturnsBadRequest()
    {
        await AuthenticateAsync();

        var allResponse = await _client.GetAsync("/api/v1/roles");
        var allRoles = await allResponse.Content.ReadFromJsonAsync<List<RoleDto>>();
        var systemRole = allRoles!.First(r => r.IsSystem);

        var response = await _client.DeleteAsync($"/api/v1/roles/{systemRole.Id}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
