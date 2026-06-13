using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Identity.Application.Interfaces;
using ResearchLms.Identity.Domain.Interfaces;
using ResearchLms.Identity.Infrastructure.EventHandlers;
using ResearchLms.Identity.Infrastructure.Persistence;
using ResearchLms.Identity.Infrastructure.Services;

namespace ResearchLms.Identity.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddIdentityInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<ITenantRepository, TenantRepository>();

        services.AddScoped<UserCreatedHandler>();
        services.AddScoped<UserUpdatedHandler>();
        services.AddScoped<UserDeletedHandler>();

        return services;
    }
}