using Hangfire;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Training.Domain.Interfaces;
using ResearchLms.Training.Infrastructure.BackgroundJobs;
using ResearchLms.Training.Infrastructure.Persistence;
using ResearchLms.Training.Infrastructure.Repositories;
using ResearchLms.Training.Infrastructure.Services;

namespace ResearchLms.Training.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddTrainingInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<TrainingDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("TrainingDb")));

        services.AddHangfire(cfg =>
            cfg.UseSqlServerStorage(configuration.GetConnectionString("TrainingDb")));
        services.AddHangfireServer();

        services.AddScoped<ICompetencyRepository, CompetencyRepository>();
        services.AddScoped<IPrerequisiteService, PrerequisiteService>();

        services.AddMassTransit(x =>
        {
            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(configuration["RabbitMQ:Host"] ?? "localhost", h =>
                {
                    h.Username(configuration["RabbitMQ:Username"] ?? "guest");
                    h.Password(configuration["RabbitMQ:Password"] ?? "guest");
                });

                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }

    public static void ConfigureRecurringJobs(this IRecurringJobManager manager)
    {
        manager.AddOrUpdate<CompetencyExpiryJob>(
            "competency-expiry-check",
            job => job.ExecuteAsync(CancellationToken.None),
            Cron.Daily);
    }
}
