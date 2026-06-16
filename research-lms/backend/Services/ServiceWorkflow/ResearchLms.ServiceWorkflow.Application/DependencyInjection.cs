using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ResearchLms.ServiceWorkflow.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddServiceWorkflowApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(AssemblyMarker).Assembly));

        services.AddValidatorsFromAssembly(typeof(AssemblyMarker).Assembly);

        return services;
    }
}
