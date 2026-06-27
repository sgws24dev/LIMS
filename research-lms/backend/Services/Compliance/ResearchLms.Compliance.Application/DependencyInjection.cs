using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace ResearchLms.Compliance.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddComplianceApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        return services;
    }
}
