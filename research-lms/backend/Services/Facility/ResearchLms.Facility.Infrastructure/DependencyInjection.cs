using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Facilities.Infrastructure.Jobs;
using ResearchLms.Facilities.Infrastructure.Persistence;
using ResearchLms.Facilities.Infrastructure.Services;

namespace ResearchLms.Facilities.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddFacilityInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IFacilityRepository, FacilityRepository>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IAssetRepository, AssetRepository>();
        services.AddScoped<IMaintenanceRepository, MaintenanceRepository>();
        services.AddScoped<ICalibrationRepository, CalibrationRepository>();
        services.AddScoped<IWorkOrderRepository, WorkOrderRepository>();
        services.AddScoped<ICustodyRepository, CustodyRepository>();
        services.AddScoped<ITelemetryRepository, TelemetryRepository>();
        services.AddScoped<IBarcodeService, BarcodeService>();
        services.AddScoped<IFacilityService, Services.FacilityService>();
        services.AddScoped<IAssetSearchService, AssetSearchService>();
        services.AddScoped<IDepreciationService, DepreciationService>();

        services.AddScoped<IDepreciationRecalculationJob, DepreciationRecalculationJob>();
        services.AddScoped<IMaintenanceOverdueJob, MaintenanceOverdueJob>();
        services.AddScoped<ICalibrationDueAlertJob, CalibrationDueAlertJob>();

        return services;
    }

    public static void AddFacilityBackgroundJobs(this IServiceCollection services, IRecurringJobManager recurringJobManager)
    {
        recurringJobManager.AddOrUpdate<IDepreciationRecalculationJob>(
            "depreciation-recalculation",
            job => job.ExecuteAsync(),
            Cron.Monthly);

        recurringJobManager.AddOrUpdate<IMaintenanceOverdueJob>(
            "maintenance-overdue",
            job => job.ExecuteAsync(),
            Cron.Daily);

        recurringJobManager.AddOrUpdate<ICalibrationDueAlertJob>(
            "calibration-due-alert",
            job => job.ExecuteAsync(),
            Cron.Daily);
    }
}
