using Hangfire;
using MassTransit;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Communications.Domain.Interfaces;
using ResearchLms.Communications.Infrastructure.Consumers;
using ResearchLms.Communications.Infrastructure.Hubs;
using ResearchLms.Communications.Infrastructure.Persistence;
using ResearchLms.Communications.Infrastructure.Repositories;
using ResearchLms.Communications.Infrastructure.Services;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCommunicationsInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<CommunicationsDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("CommunicationsDb")));

        services.AddHangfire(cfg =>
            cfg.UseSqlServerStorage(configuration.GetConnectionString("CommunicationsDb")));
        services.AddHangfireServer();

        // Repositories
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<INotificationTemplateRepository, NotificationTemplateRepository>();
        services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>();
        services.AddScoped<IAnnouncementRepository, AnnouncementRepository>();

        // Notification services
        var sendGridKey = configuration["SendGrid:ApiKey"];
        if (!string.IsNullOrEmpty(sendGridKey))
        {
            services.AddHttpClient<IEmailService, SendGridEmailService>();
        }
        else
        {
            services.AddSingleton<IEmailService, SmtpEmailService>();
        }

        services.AddSingleton<ISmsService, TwilioSmsService>();
        services.AddHttpClient<ITeamsNotificationService, TeamsNotificationService>();

        // SignalR
        services.AddSignalR();
        services.AddScoped<INotificationService, NotificationDispatcher>();

        // MassTransit
        services.AddMassTransit(x =>
        {
            x.AddConsumer<SendNotificationConsumer>();
            x.AddConsumer<UserCreatedConsumer>();

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

    public static void MapNotificationsHub(this WebApplication app)
    {
        app.MapHub<NotificationsHub>("/hubs/notifications");
    }
}
