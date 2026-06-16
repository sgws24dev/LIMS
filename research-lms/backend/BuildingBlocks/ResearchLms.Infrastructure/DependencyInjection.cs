using System.Text;
using Hangfire;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Identity.Web;
using ResearchLms.Infrastructure.Auth;
using ResearchLms.Infrastructure.BackgroundJobs;
using ResearchLms.Infrastructure.Contexts;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Infrastructure.Search;
using ResearchLms.Infrastructure.Storage;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
        services.AddDbContext<ResearchLmsDbContext>((sp, options) =>
        {
            if (env == "Testing")
            {
                var connection = sp.GetRequiredService<SqliteConnection>();
                options.UseSqlite(connection);
            }
            else
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
        });
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ResearchLmsDbContext>());

        var jwtSettings = configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()!;
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        // OIDC / Entra ID: When AzureAd section is present in config, add:
        //   services.AddAuthentication().AddMicrosoftIdentityWebApi(configuration.GetSection("AzureAd"));
        // Requires Microsoft.Identity.Web NuGet package.

        if (env != "Testing")
        {
            services.AddMassTransit(busConfigurator =>
            {
                busConfigurator.UsingRabbitMq((context, cfg) =>
                {
                    var host = configuration.GetValue<string>("RabbitMQ:Host") ?? "localhost";
                    cfg.Host(host);
                });
            });
            services.AddScoped<EventBus.IEventBus, EventBus.EventBus>();

            services.AddHangfire(cfg =>
                cfg.UseSqlServerStorage(configuration.GetConnectionString("DefaultConnection")));
            services.AddHangfireServer();
            services.AddScoped<IJobService, JobService>();
        }

        var azureAdSection = configuration.GetSection("AzureAd");
        if (azureAdSection.Exists() && !string.IsNullOrEmpty(azureAdSection["ClientId"]))
        {
            services.AddAuthentication()
                .AddMicrosoftIdentityWebApi(azureAdSection);
        }

        services.AddElasticsearch(configuration);
        services.AddScoped<ISearchService, ElasticsearchService>();

        services.AddScoped<IFileStorageService, FileStorageService>();

        services.AddScoped<ITenantContext, TenantContext>();
        services.AddScoped<ICurrentUser, CurrentUser>();

        return services;
    }
}
