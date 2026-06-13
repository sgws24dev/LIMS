namespace ResearchLms.Identity.Api.Controllers;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Shared.Domain;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public AuthController(IIdentityService identityService) => _identityService = identityService;

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
        var result = await _identityService.LoginAsync(request, ipAddress, default);
        return result.IsSuccess ? Ok(result.Value) : Unauthorized(result.Error);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshTokenRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
        var result = await _identityService.RefreshTokenAsync(request.RefreshToken, ipAddress, default);
        return result.IsSuccess ? Ok(result.Value) : Unauthorized(result.Error);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var result = await _identityService.ForgotPasswordAsync(request.Email, default);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        var result = await _identityService.ResetPasswordAsync(request.Token, request.NewPassword, default);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userId = GetUserId();
        var result = await _identityService.ChangePasswordAsync(userId, request, default);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(RefreshTokenRequest request)
    {
        var userId = GetUserId();
        var result = await _identityService.LogoutAsync(userId, request.RefreshToken, default);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
