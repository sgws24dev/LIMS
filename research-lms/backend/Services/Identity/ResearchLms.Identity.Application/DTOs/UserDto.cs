namespace ResearchLms.Identity.Application.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    string? Phone,
    string? AvatarUrl,
    bool IsActive,
    bool IsMfaEnabled,
    DateTime? LastLoginAt,
    DateTime CreatedAt,
    List<RoleDto> Roles
);

public record RoleDto(
    Guid Id,
    string Name,
    string Description,
    bool IsSystem,
    List<PermissionDto> Permissions
);

public record PermissionDto(
    string Module,
    bool CanView,
    bool CanCreate,
    bool CanEdit,
    bool CanDelete
);

public record TenantDto(
    Guid Id,
    string Name,
    string Code,
    string? Domain,
    string? LogoUrl,
    string SubscriptionPlan,
    bool IsActive,
    string? ContactEmail,
    DateTime CreatedAt
);

public record CreateUserDto(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Phone,
    List<Guid> RoleIds
);

public record UpdateUserDto(
    string FirstName,
    string LastName,
    string? Phone,
    List<Guid> RoleIds,
    bool IsActive
);

public record CreateRoleDto(
    string Name,
    string Description,
    List<PermissionDto> Permissions
);

public record UpdateRoleDto(
    string Name,
    string Description,
    List<PermissionDto> Permissions
);

public record CreateTenantDto(
    string Name,
    string Code,
    string? Domain,
    string? ContactEmail,
    string? ContactPhone
);

public record PagedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public record UserFilter(
    string? SearchTerm,
    bool? IsActive,
    string? Role,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "createdAt",
    string SortDirection = "desc"
);

public record LoginRequest(string Email, string Password);
public record LoginResponse(string AccessToken, string RefreshToken, UserDto User);
public record RefreshTokenRequest(string RefreshToken);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Token, string NewPassword);
