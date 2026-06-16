using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Institution.Application.Interfaces;
using ResearchLms.Institution.Domain.Interfaces;
using ResearchLms.Institution.Infrastructure.Persistence;
using ResearchLms.Institution.Infrastructure.Services;

namespace ResearchLms.Institution.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInstitutionInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IInstitutionSettingsRepository, InstitutionSettingsRepository>();
        services.AddScoped<IInstitutionService, Services.InstitutionService>();
        return services;
    }
}
