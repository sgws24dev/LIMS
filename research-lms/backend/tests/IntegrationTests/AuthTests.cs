using System.Net;
using System.Net.Http.Json;
using ResearchLms.Identity.Application.DTOs;

namespace ResearchLms.IntegrationTests;

public class AuthTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        factory.SeedTestDataAsync().GetAwaiter().GetResult();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkWithTokens()
    {
        var request = new LoginRequest("admin@researchlms.com", "Admin@123!");

        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotNull(result);
        Assert.NotEmpty(result!.AccessToken);
        Assert.NotEmpty(result.RefreshToken);
        Assert.NotNull(result.User);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        var request = new LoginRequest("admin@researchlms.com", "WrongPassword!");

        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_ReturnsUnauthorized()
    {
        var request = new LoginRequest("nonexistent@test.com", "SomePass1!");

        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithEmptyCredentials_ReturnsUnauthorized()
    {
        var request = new LoginRequest("", "");

        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
