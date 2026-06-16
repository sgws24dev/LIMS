using Moq;
using ResearchLms.Identity.Application.Commands;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.UnitTests.Application;

public class CreateUserCommandTests
{
    private readonly Mock<IIdentityService> _serviceMock;
    private readonly CreateUserCommandHandler _handler;

    public CreateUserCommandTests()
    {
        _serviceMock = new Mock<IIdentityService>();
        _handler = new CreateUserCommandHandler(_serviceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidData_ReturnsSuccess()
    {
        var dto = new CreateUserDto("test@test.com", "Pass123!", "John", "Doe", null, []);
        var command = new CreateUserCommand(dto, Guid.NewGuid());
        var expected = Result.Success(new UserDto(Guid.NewGuid(), "test@test.com", "John", "Doe", "John Doe", null, null, true, false, null, DateTime.UtcNow, []));

        _serviceMock.Setup(s => s.CreateUserAsync(dto, command.CreatedBy, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("test@test.com", result.Value!.Email);
    }

    [Fact]
    public async Task Handle_WhenEmailExists_ReturnsFailure()
    {
        var dto = new CreateUserDto("existing@test.com", "Pass123!", "John", "Doe", null, []);
        var command = new CreateUserCommand(dto, Guid.NewGuid());
        var expected = Result.Failure<UserDto>("EMAIL_EXISTS", "A user with this email already exists.");

        _serviceMock.Setup(s => s.CreateUserAsync(dto, command.CreatedBy, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal("EMAIL_EXISTS", result.Error);
    }
}
