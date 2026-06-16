using Microsoft.Extensions.DependencyInjection;

namespace ResearchLms.Institution.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddInstitutionApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));
        return services;
    }
}
