using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Compliance.Domain.Interfaces;
using ResearchLms.Compliance.Infrastructure.Persistence;
using ResearchLms.Compliance.Infrastructure.Persistence.Repositories;
using ResearchLms.Compliance.Infrastructure.Services;

namespace ResearchLms.Compliance.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddComplianceInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ComplianceDbContext>((sp, options) =>
            options.UseSqlServer(configuration.GetConnectionString("ComplianceDb"))
                   .AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>()));

        services.AddScoped<AuditSaveChangesInterceptor>();
        services.AddScoped<IChangeReasonProvider, ChangeReasonProvider>();

        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<ISignatureRepository, SignatureRepository>();

        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<ISignatureService, SignatureService>();
        services.AddScoped<IChangeTrackingService, ChangeTrackingService>();

        return services;
    }

    private class ChangeReasonProvider : IChangeReasonProvider
    {
        public string? CurrentChangeReason { get; private set; }
        public void SetChangeReason(string reason) => CurrentChangeReason = reason;
    }
}
