namespace ResearchLms.Identity.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using ResearchLms.Infrastructure.Auth;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Identity.Application.Mappings;
using ResearchLms.Identity.Domain.Interfaces;
using ResearchLms.Shared.Domain.Entities;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 10);
    }

    public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
}

public sealed class IdentityService : IIdentityService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ResearchLmsDbContext _dbContext;

    public IdentityService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        ITenantRepository tenantRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext,
        IPasswordHasher passwordHasher,
        ResearchLmsDbContext dbContext)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _tenantRepository = tenantRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
        _passwordHasher = passwordHasher;
        _dbContext = dbContext;
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, string ipAddress, CancellationToken ct)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), ct);
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result.Failure<LoginResponse>("INVALID_CREDENTIALS", "Invalid email or password.");

        if (!user.IsActive)
            return Result.Failure<LoginResponse>("USER_INACTIVE", "User account is deactivated.");

        var roles = await _roleRepository.GetUserRolesAsync(user.Id, ct);
        var roleNames = roles.Select(r => r.Name).ToArray();

        var (accessToken, expiresAt) = _jwtTokenGenerator.GenerateAccessToken(user.Id, user.Email, roleNames, _tenantContext.TenantId);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        var rtEntity = new RefreshToken(user.Id, refreshToken, expiresAt.AddDays(7), ipAddress);
        _dbContext.RefreshTokens.Add(rtEntity);
        user.RecordLogin();

        await _unitOfWork.SaveChangesAsync(ct);

        var userDto = UserMapping.ToDto(user, roles.ToList());
        return Result.Success(new LoginResponse(accessToken, refreshToken, userDto));
    }

    public async Task<Result<LoginResponse>> RefreshTokenAsync(string refreshToken, string ipAddress, CancellationToken ct)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(refreshToken, ct);
        if (user is null)
            return Result.Failure<LoginResponse>("INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.");

        var existingRt = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken);
        if (existingRt is null || !existingRt.IsActive)
            return Result.Failure<LoginResponse>("INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.");

        existingRt.Revoke(ipAddress, refreshToken);

        var roles = await _roleRepository.GetUserRolesAsync(user.Id, ct);
        var roleNames = roles.Select(r => r.Name).ToArray();

        var (newAccessToken, expiresAt) = _jwtTokenGenerator.GenerateAccessToken(user.Id, user.Email, roleNames, _tenantContext.TenantId);
        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        var newRt = new RefreshToken(user.Id, newRefreshToken, expiresAt.AddDays(7), ipAddress);
        _dbContext.RefreshTokens.Add(newRt);

        await _unitOfWork.SaveChangesAsync(ct);

        var userDto = UserMapping.ToDto(user, roles.ToList());
        return Result.Success(new LoginResponse(newAccessToken, newRefreshToken, userDto));
    }

    public async Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user is null)
            return Result.Failure("USER_NOT_FOUND", "User not found.");

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            return Result.Failure("INVALID_PASSWORD", "Current password is incorrect.");

        var newHash = _passwordHasher.Hash(request.NewPassword);
        user.ChangePassword(newHash);

        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> LogoutAsync(Guid userId, string refreshToken, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user is null)
            return Result.Failure("USER_NOT_FOUND", "User not found.");

        var token = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken);
        if (token is not null && token.IsActive)
        {
            token.Revoke(string.Empty, null);
            await _unitOfWork.SaveChangesAsync(ct);
        }

        return Result.Success();
    }

    public async Task<Result<PagedResult<UserDto>>> GetUsersAsync(UserFilter filter, CancellationToken ct)
    {
        var (items, totalCount) = await _userRepository.GetAllAsync(
            filter.Page, filter.PageSize, filter.SearchTerm, filter.IsActive, ct);

        var userIds = items.Select(u => u.Id).ToList();
        var userRoles = new Dictionary<Guid, List<Role>>();

        foreach (var userId in userIds)
        {
            var roles = await _roleRepository.GetUserRolesAsync(userId, ct);
            userRoles[userId] = roles.ToList();
        }

        var dtos = items.Select(u => UserMapping.ToDto(u, userRoles.GetValueOrDefault(u.Id, new()))).ToList();
        var paged = UserMapping.ToPaged(dtos, totalCount, filter.Page, filter.PageSize);

        return Result.Success(paged);
    }

    public async Task<Result<UserDto>> GetUserByIdAsync(Guid id, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(id, ct);
        if (user is null)
            return Result.Failure<UserDto>("USER_NOT_FOUND", "User not found.");

        var roles = await _roleRepository.GetUserRolesAsync(user.Id, ct);
        return Result.Success(UserMapping.ToDto(user, roles.ToList()));
    }

    public async Task<Result<UserDto>> CreateUserAsync(CreateUserDto dto, Guid createdBy, CancellationToken ct)
    {
        var exists = await _userRepository.ExistsAsync(dto.Email, ct);
        if (exists)
            return Result.Failure<UserDto>("EMAIL_EXISTS", "A user with this email already exists.");

        var passwordHash = _passwordHasher.Hash(dto.Password);
        var user = User.Create(dto.Email, passwordHash, dto.FirstName, dto.LastName);

        await _userRepository.AddAsync(user, ct);

        if (dto.RoleIds?.Count > 0)
        {
            foreach (var roleId in dto.RoleIds)
            {
                var userRole = new UserRole(user.Id, roleId, createdBy.ToString());
                _dbContext.UserRoles.Add(userRole);
            }
        }

        await _unitOfWork.SaveChangesAsync(ct);

        var roles = await _roleRepository.GetUserRolesAsync(user.Id, ct);
        return Result.Success(UserMapping.ToDto(user, roles.ToList()));
    }

    public async Task<Result<UserDto>> UpdateUserAsync(Guid id, UpdateUserDto dto, Guid updatedBy, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(id, ct);
        if (user is null)
            return Result.Failure<UserDto>("USER_NOT_FOUND", "User not found.");

        user.UpdateProfile(dto.FirstName, dto.LastName, dto.Phone, null);

        if (!dto.IsActive && user.IsActive)
            user.Deactivate();

        var existingRoles = await _dbContext.UserRoles.Where(ur => ur.UserId == id).ToListAsync(ct);
        _dbContext.UserRoles.RemoveRange(existingRoles);

        if (dto.RoleIds?.Count > 0)
        {
            foreach (var roleId in dto.RoleIds)
            {
                _dbContext.UserRoles.Add(new UserRole(id, roleId, updatedBy.ToString()));
            }
        }

        await _unitOfWork.SaveChangesAsync(ct);

        var roles = await _roleRepository.GetUserRolesAsync(user.Id, ct);
        return Result.Success(UserMapping.ToDto(user, roles.ToList()));
    }

    public async Task<Result> DeleteUserAsync(Guid id, Guid deletedBy, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(id, ct);
        if (user is null)
            return Result.Failure("USER_NOT_FOUND", "User not found.");

        await _userRepository.DeleteAsync(id, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<List<RoleDto>>> GetRolesAsync(CancellationToken ct)
    {
        var roles = await _roleRepository.GetAllAsync(ct);
        var dtos = roles.Select(UserMapping.ToDto).ToList();
        return Result.Success(dtos);
    }

    public async Task<Result<RoleDto>> GetRoleByIdAsync(Guid id, CancellationToken ct)
    {
        var role = await _roleRepository.GetByIdAsync(id, ct);
        if (role is null)
            return Result.Failure<RoleDto>("ROLE_NOT_FOUND", "Role not found.");

        return Result.Success(UserMapping.ToDto(role));
    }

    public async Task<Result<RoleDto>> CreateRoleAsync(CreateRoleDto dto, CancellationToken ct)
    {
        var existing = await _roleRepository.GetByNameAsync(dto.Name, ct);
        if (existing is not null)
            return Result.Failure<RoleDto>("ROLE_EXISTS", "A role with this name already exists.");

        var role = Role.Create(dto.Name, dto.Description);

        if (dto.Permissions?.Count > 0)
        {
            foreach (var p in dto.Permissions)
            {
                role.AddPermission(new Permission(p.Module, p.CanView, p.CanCreate, p.CanEdit, p.CanDelete));
            }
        }

        await _roleRepository.AddAsync(role, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Success(UserMapping.ToDto(role));
    }

    public async Task<Result<RoleDto>> UpdateRoleAsync(Guid id, UpdateRoleDto dto, CancellationToken ct)
    {
        var role = await _roleRepository.GetByIdAsync(id, ct);
        if (role is null)
            return Result.Failure<RoleDto>("ROLE_NOT_FOUND", "Role not found.");

        var existing = await _roleRepository.GetByNameAsync(dto.Name, ct);
        if (existing is not null && existing.Id != id)
            return Result.Failure<RoleDto>("ROLE_EXISTS", "A role with this name already exists.");

        role.UpdateDetails(dto.Name, dto.Description);

        await _dbContext.Permissions
            .Where(p => EF.Property<Guid>(p, "RoleId") == id)
            .ExecuteDeleteAsync(ct);

        foreach (var p in dto.Permissions)
        {
            var newPermission = new Permission(p.Module, p.CanView, p.CanCreate, p.CanEdit, p.CanDelete);
            _dbContext.Permissions.Add(newPermission);
            _dbContext.Entry(newPermission).Property("RoleId").CurrentValue = id;
        }

        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Success(UserMapping.ToDto(role));
    }

    public async Task<Result> DeleteRoleAsync(Guid id, CancellationToken ct)
    {
        var role = await _roleRepository.GetByIdAsync(id, ct);
        if (role is null)
            return Result.Failure("ROLE_NOT_FOUND", "Role not found.");

        if (role.IsSystem)
            return Result.Failure("SYSTEM_ROLE", "System roles cannot be deleted.");

        await _roleRepository.DeleteAsync(id, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<List<TenantDto>>> GetTenantsAsync(CancellationToken ct)
    {
        var tenants = await _tenantRepository.GetAllAsync(ct);
        var dtos = tenants.Select(UserMapping.ToDto).ToList();
        return Result.Success(dtos);
    }

    public async Task<Result<TenantDto>> GetTenantByIdAsync(Guid id, CancellationToken ct)
    {
        var tenant = await _tenantRepository.GetByIdAsync(id, ct);
        if (tenant is null)
            return Result.Failure<TenantDto>("TENANT_NOT_FOUND", "Tenant not found.");

        return Result.Success(UserMapping.ToDto(tenant));
    }

    public async Task<Result<TenantDto>> CreateTenantAsync(CreateTenantDto dto, CancellationToken ct)
    {
        var exists = await _tenantRepository.ExistsAsync(dto.Code, ct);
        if (exists)
            return Result.Failure<TenantDto>("TENANT_EXISTS", "A tenant with this code already exists.");

        var tenant = Tenant.Create(dto.Name, dto.Code, dto.Domain, dto.ContactEmail);
        await _tenantRepository.AddAsync(tenant, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Success(UserMapping.ToDto(tenant));
    }

    public async Task<Result<TenantDto>> UpdateTenantAsync(Guid id, CreateTenantDto dto, CancellationToken ct)
    {
        var tenant = await _tenantRepository.GetByIdAsync(id, ct);
        if (tenant is null)
            return Result.Failure<TenantDto>("TENANT_NOT_FOUND", "Tenant not found.");

        tenant.UpdateDetails(dto.Name, dto.Domain, null, dto.ContactEmail, dto.ContactPhone, null);
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Success(UserMapping.ToDto(tenant));
    }

    public async Task<Result> DeleteTenantAsync(Guid id, CancellationToken ct)
    {
        var tenant = await _tenantRepository.GetByIdAsync(id, ct);
        if (tenant is null)
            return Result.Failure("TENANT_NOT_FOUND", "Tenant not found.");

        tenant.Suspend();
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> ForgotPasswordAsync(string email, CancellationToken ct)
    {
        var user = await _userRepository.GetByEmailAsync(email.Trim().ToLowerInvariant(), ct);
        if (user is null)
            return Result.Success();

        var raw = Guid.NewGuid().ToByteArray().Concat(Guid.NewGuid().ToByteArray()).ToArray();
        var token = Convert.ToBase64String(raw).Replace("/", "_").Replace("+", "-").TrimEnd('=');
        user.SetPasswordResetToken(token, DateTime.UtcNow.AddHours(1));
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> ResetPasswordAsync(string token, string newPassword, CancellationToken ct)
    {
        var user = await _userRepository.GetByPasswordResetTokenAsync(token, ct);
        if (user is null)
            return Result.Failure("INVALID_RESET_TOKEN", "The password reset token is invalid or has expired.");

        if (newPassword.Length < 8)
            return Result.Failure("WEAK_PASSWORD", "Password must be at least 8 characters long.");

        user.ChangePassword(_passwordHasher.Hash(newPassword));
        user.ClearPasswordResetToken();
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<bool>> CheckPermissionAsync(Guid userId, string module, string action, string? resourceType = null, Dictionary<string, string>? resourceAttributes = null, CancellationToken ct = default)
    {
        var roles = await _roleRepository.GetUserRolesAsync(userId, ct);

        var (requireView, requireCreate, requireEdit, requireDelete) = action.ToLowerInvariant() switch
        {
            "view" => (true, false, false, false),
            "create" => (false, true, false, false),
            "edit" or "update" => (false, false, true, false),
            "delete" => (false, false, false, true),
            _ => (true, true, true, true)
        };

        var hasRbacPermission = roles.Any(r => r.HasPermission(module, requireView, requireCreate, requireEdit, requireDelete));
        if (hasRbacPermission)
            return Result.Success(true);

        if (resourceType is not null)
        {
            var abacRules = await _roleRepository.GetAbacRulesAsync(resourceType, ct);
            foreach (var rule in abacRules.Where(r => r.IsEnabled).OrderByDescending(r => r.Priority))
            {
                if (resourceAttributes is not null && resourceAttributes.TryGetValue(rule.AttributeName, out var actualValue))
                {
                    var matches = rule.Operator switch
                    {
                        AbacOperator.Eq => string.Equals(rule.AttributeValue, actualValue, StringComparison.OrdinalIgnoreCase),
                        AbacOperator.Neq => !string.Equals(rule.AttributeValue, actualValue, StringComparison.OrdinalIgnoreCase),
                        _ => false
                    };

                    if (matches)
                        return Result.Success(rule.Effect == AbacEffect.Allow);
                }
            }
        }

        return Result.Success(false);
    }

    public async Task<Result<List<PermissionDto>>> GetUserPermissionsAsync(Guid userId, CancellationToken ct)
    {
        var roles = await _roleRepository.GetUserRolesAsync(userId, ct);
        var permissions = roles
            .SelectMany(r => r.Permissions)
            .GroupBy(p => p.Module)
            .Select(g => new PermissionDto(
                g.Key,
                g.Any(p => p.CanView),
                g.Any(p => p.CanCreate),
                g.Any(p => p.CanEdit),
                g.Any(p => p.CanDelete)
            ))
            .ToList();

        return Result.Success(permissions);
    }
}
