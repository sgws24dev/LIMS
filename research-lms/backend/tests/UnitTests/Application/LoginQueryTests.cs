using Moq;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Identity.Application.Queries;
using ResearchLms.Shared.Domain;

namespace ResearchLms.UnitTests.Application;

public class LoginQueryTests
{
    private readonly Mock<IIdentityService> _serviceMock;
    private readonly LoginQueryHandler _handler;

    public LoginQueryTests()
    {
        _serviceMock = new Mock<IIdentityService>();
        _handler = new LoginQueryHandler(_serviceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCredentials_ReturnsLoginResponse()
    {
        var request = new LoginRequest("admin@test.com", "Pass123!");
        var query = new LoginQuery(request, "127.0.0.1");
        var userDto = new UserDto(Guid.NewGuid(), "admin@test.com", "Admin", "User", "Admin User", null, null, true, false, null, DateTime.UtcNow, []);
        var expected = Result.Success(new LoginResponse("access-token", "refresh-token", userDto));

        _serviceMock.Setup(s => s.LoginAsync(request, "127.0.0.1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("access-token", result.Value!.AccessToken);
    }

    [Fact]
    public async Task Handle_WithInvalidCredentials_ReturnsFailure()
    {
        var request = new LoginRequest("admin@test.com", "WrongPass!");
        var query = new LoginQuery(request, "127.0.0.1");
        var expected = Result.Failure<LoginResponse>("INVALID_CREDENTIALS", "Invalid email or password.");

        _serviceMock.Setup(s => s.LoginAsync(request, "127.0.0.1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal("INVALID_CREDENTIALS", result.Error);
    }
}
