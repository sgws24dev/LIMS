using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ResearchLms.Scheduling.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddSchedulingApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(AssemblyMarker).Assembly));

        services.AddValidatorsFromAssembly(typeof(AssemblyMarker).Assembly);

        return services;
    }
}
