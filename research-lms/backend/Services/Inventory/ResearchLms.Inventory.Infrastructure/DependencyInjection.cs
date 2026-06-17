using Hangfire;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Inventory.Domain.Interfaces;
using ResearchLms.Inventory.Infrastructure.BackgroundJobs;
using ResearchLms.Inventory.Infrastructure.Persistence;
using ResearchLms.Inventory.Infrastructure.Repositories;
using ResearchLms.Inventory.Infrastructure.Services;

namespace ResearchLms.Inventory.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInventoryInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<InventoryDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("InventoryDb")));

        services.AddScoped<IInventoryItemRepository, InventoryItemRepository>();
        services.AddScoped<IVendorRepository, VendorRepository>();
        services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();
        services.AddScoped<IStockTransactionRepository, StockTransactionRepository>();

        services.AddScoped<IBarcodeScanService, BarcodeScanService>();
        services.AddScoped<IStockAlertService, StockAlertService>();
        services.AddScoped<ILowStockCheckJob, LowStockCheckJob>();

        services.AddMassTransit(x =>
        {
            x.AddConsumer<LowStockAlertEventConsumer>();
            x.UsingRabbitMq((ctx, cfg) =>
            {
                cfg.Host(configuration["RabbitMQ:Host"] ?? "localhost");
                cfg.ConfigureEndpoints(ctx);
            });
        });

        services.AddHangfire(config =>
            config.UseSqlServerStorage(
                configuration.GetConnectionString("InventoryDb")));
        services.AddHangfireServer();

        return services;
    }

    public static void ConfigureRecurringJobs(IRecurringJobManager recurringJobManager)
    {
        recurringJobManager.AddOrUpdate<ILowStockCheckJob>(
            "low-stock-check",
            job => job.ExecuteAsync(),
            "0 * * * *");
    }
}
