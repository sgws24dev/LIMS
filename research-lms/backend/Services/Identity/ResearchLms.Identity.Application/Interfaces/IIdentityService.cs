using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Identity.Application.Interfaces;

public interface IIdentityService
{
    // Auth
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request, string ipAddress, CancellationToken ct);
    Task<Result<LoginResponse>> RefreshTokenAsync(string refreshToken, string ipAddress, CancellationToken ct);
    Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct);
    Task<Result> LogoutAsync(Guid userId, string refreshToken, CancellationToken ct);

    // Users
    Task<Result<PagedResult<UserDto>>> GetUsersAsync(UserFilter filter, CancellationToken ct);
    Task<Result<UserDto>> GetUserByIdAsync(Guid id, CancellationToken ct);
    Task<Result<UserDto>> CreateUserAsync(CreateUserDto dto, Guid createdBy, CancellationToken ct);
    Task<Result<UserDto>> UpdateUserAsync(Guid id, UpdateUserDto dto, Guid updatedBy, CancellationToken ct);
    Task<Result> DeleteUserAsync(Guid id, Guid deletedBy, CancellationToken ct);

    // Roles
    Task<Result<List<RoleDto>>> GetRolesAsync(CancellationToken ct);
    Task<Result<RoleDto>> GetRoleByIdAsync(Guid id, CancellationToken ct);
    Task<Result<RoleDto>> CreateRoleAsync(CreateRoleDto dto, CancellationToken ct);
    Task<Result<RoleDto>> UpdateRoleAsync(Guid id, UpdateRoleDto dto, CancellationToken ct);
    Task<Result> DeleteRoleAsync(Guid id, CancellationToken ct);

    // Tenants
    Task<Result<List<TenantDto>>> GetTenantsAsync(CancellationToken ct);
    Task<Result<TenantDto>> GetTenantByIdAsync(Guid id, CancellationToken ct);
    Task<Result<TenantDto>> CreateTenantAsync(CreateTenantDto dto, CancellationToken ct);
    Task<Result<TenantDto>> UpdateTenantAsync(Guid id, CreateTenantDto dto, CancellationToken ct);
    Task<Result> DeleteTenantAsync(Guid id, CancellationToken ct);

    // Password Reset
    Task<Result> ForgotPasswordAsync(string email, CancellationToken ct);
    Task<Result> ResetPasswordAsync(string token, string newPassword, CancellationToken ct);

    // Permissions / ABAC
    Task<Result<bool>> CheckPermissionAsync(Guid userId, string module, string action, string? resourceType = null, Dictionary<string, string>? resourceAttributes = null, CancellationToken ct = default);
    Task<Result<List<PermissionDto>>> GetUserPermissionsAsync(Guid userId, CancellationToken ct);
}
