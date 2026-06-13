using ResearchLms.Identity.Application.DTOs;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Identity.Application.Mappings;

public static class UserMapping
{
    public static UserDto ToDto(User user, List<Role> roles)
    {
        return new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            $"{user.FirstName} {user.LastName}".Trim(),
            user.Phone ?? string.Empty,
            user.AvatarUrl,
            user.IsActive,
            user.IsMfaEnabled,
            user.LastLoginAt,
            user.CreatedAt,
            roles.Select(ToDto).ToList()
        );
    }

    public static RoleDto ToDto(Role role)
    {
        return new RoleDto(
            role.Id,
            role.Name,
            role.Description ?? string.Empty,
            role.IsSystem,
            role.Permissions.Select(ToDto).ToList()
        );
    }

    public static PermissionDto ToDto(Permission permission)
    {
        return new PermissionDto(
            permission.Module,
            permission.CanView,
            permission.CanCreate,
            permission.CanEdit,
            permission.CanDelete
        );
    }

    public static TenantDto ToDto(Tenant tenant)
    {
        return new TenantDto(
            tenant.Id,
            tenant.Name,
            tenant.Code,
            tenant.Domain,
            tenant.LogoUrl,
            tenant.SubscriptionPlan ?? "free",
            tenant.IsActive,
            tenant.ContactEmail,
            tenant.CreatedAt
        );
    }

    public static PagedResult<T> ToPaged<T>(List<T> items, int totalCount, int page, int pageSize)
    {
        var totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0;

        return new PagedResult<T>(
            items,
            totalCount,
            page,
            pageSize,
            totalPages
        );
    }
}
