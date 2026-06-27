using Hangfire;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Infrastructure.Contexts;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.BackgroundJobs;
using ResearchLms.Scheduling.Infrastructure.EventConsumers;
using ResearchLms.Scheduling.Infrastructure.Persistence;
using ResearchLms.Scheduling.Infrastructure.Repositories;
using ResearchLms.Scheduling.Infrastructure.Services;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Scheduling.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddSchedulingInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<ITenantContext, TenantContext>();
        services.AddDbContext<SchedulingDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("SchedulingDb")));

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
            options.InstanceName = "Scheduling:";
        });

        services.AddHangfire(cfg =>
            cfg.UseSqlServerStorage(configuration.GetConnectionString("SchedulingDb")));
        services.AddHangfireServer();

        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IBookingResourceRepository, BookingResourceRepository>();
        services.AddScoped<IConstraintRepository, ConstraintRepository>();
        services.AddScoped<IWaitlistRepository, WaitlistRepository>();
        services.AddScoped<IMaintenanceWindowRepository, MaintenanceWindowRepository>();
        services.AddScoped<IOperatingHoursRepository, OperatingHoursRepository>();
        services.AddScoped<IRecurringRuleRepository, RecurringRuleRepository>();
        services.AddScoped<ICalendarConnectionRepository, CalendarConnectionRepository>();
        services.AddScoped<ICalendarSyncLogRepository, CalendarSyncLogRepository>();
        services.AddScoped<ICalendarEventMappingRepository, CalendarEventMappingRepository>();
        services.AddScoped<ITrainerAvailabilityRepository, TrainerAvailabilityRepository>();

        services.AddScoped<IAvailabilityService, AvailabilityService>();
        services.AddScoped<IConstraintEvaluationService, ConstraintEvaluationService>();
        services.AddScoped<IWaitlistService, WaitlistService>();
        services.AddScoped<ResearchLms.Scheduling.Domain.Interfaces.INotificationService, NotificationService>();
        services.AddScoped<IWaitlistPromotionJob, WaitlistPromotionJob>();
        services.AddScoped<IRecurringRuleService, RecurringRuleService>();
        services.AddScoped<IPricingService, PricingService>();
        services.AddScoped<IRecurringBookingJob, RecurringBookingJob>();

        services.AddScoped<GraphAuthService>();
        services.AddScoped<ICalendarSyncService, CalendarSyncService>();
        services.AddScoped<ITrainerSyncService, TrainerSyncService>();
        services.AddScoped<ICalendarSyncJob, CalendarSyncJob>();

        services.AddMassTransit(x =>
        {
            x.AddConsumer<AssetCreatedEventConsumer>();
            x.AddConsumer<AssetUpdatedEventConsumer>();
            x.AddConsumer<AssetDecommissionedEventConsumer>();
            x.AddConsumer<MaintenanceScheduledConsumer>();

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
        manager.AddOrUpdate<IWaitlistPromotionJob>(
            "waitlist-promotion-check",
            job => job.ExecuteAsync(),
            "*/15 * * * *");

        manager.AddOrUpdate<IRecurringBookingJob>(
            "recurring-booking-generation",
            job => job.ExecuteAsync(),
            Cron.Daily(2, 0));

        manager.AddOrUpdate<ICalendarSyncJob>(
            "calendar-sync",
            job => job.ExecuteAsync(),
            "*/15 * * * *");
    }
}
