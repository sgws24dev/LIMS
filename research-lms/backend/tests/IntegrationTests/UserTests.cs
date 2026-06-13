using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using ResearchLms.Identity.Application.DTOs;

namespace ResearchLms.IntegrationTests;

public class UserTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public UserTests(CustomWebApplicationFactory factory)
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
    public async Task GetUsers_WhenAuthenticated_ReturnsOkWithPagedResult()
    {
        await AuthenticateAsync();

        var response = await _client.GetAsync("/api/v1/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<PagedResult<UserDto>>();
        Assert.NotNull(result);
        Assert.NotEmpty(result!.Items);
    }

    [Fact]
    public async Task GetUsers_WhenNotAuthenticated_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/v1/users");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_WithValidData_ReturnsOk()
    {
        await AuthenticateAsync();

        var dto = new CreateUserDto(
            "newuser@test.com",
            "TestPass123!",
            "New",
            "User",
            "+1234567890",
            []);

        var response = await _client.PostAsJsonAsync("/api/v1/users", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(user);
        Assert.Equal("newuser@test.com", user!.Email);
    }

    [Fact]
    public async Task GetUserById_WithValidId_ReturnsUser()
    {
        await AuthenticateAsync();

        var allResponse = await _client.GetAsync("/api/v1/users");
        var allResult = await allResponse.Content.ReadFromJsonAsync<PagedResult<UserDto>>();
        var firstUserId = allResult!.Items[0].Id;

        var response = await _client.GetAsync($"/api/v1/users/{firstUserId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(user);
        Assert.Equal(firstUserId, user!.Id);
    }

    [Fact]
    public async Task UpdateUser_WithValidData_ReturnsOk()
    {
        await AuthenticateAsync();

        var allResponse = await _client.GetAsync("/api/v1/users");
        var allResult = await allResponse.Content.ReadFromJsonAsync<PagedResult<UserDto>>();
        var firstUserId = allResult!.Items[0].Id;

        var dto = new UpdateUserDto("Updated", "Name", "+1111111111", [], true);

        var response = await _client.PutAsJsonAsync($"/api/v1/users/{firstUserId}", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(user);
        Assert.Equal("Updated", user!.FirstName);
    }

    [Fact]
    public async Task DeleteUser_WithValidId_ReturnsNoContent()
    {
        await AuthenticateAsync();

        var dto = new CreateUserDto(
            "deleteuser@test.com",
            "Delete123!",
            "Delete",
            "Me",
            null,
            []);

        var createResponse = await _client.PostAsJsonAsync("/api/v1/users", dto);
        var created = await createResponse.Content.ReadFromJsonAsync<UserDto>();

        var response = await _client.DeleteAsync($"/api/v1/users/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
