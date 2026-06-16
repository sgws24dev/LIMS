using Microsoft.Extensions.DependencyInjection;

namespace ResearchLms.Facilities.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddFacilityApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));
        return services;
    }
}
