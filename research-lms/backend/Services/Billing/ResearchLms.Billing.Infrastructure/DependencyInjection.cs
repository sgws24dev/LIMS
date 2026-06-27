using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;
using ResearchLms.Billing.Infrastructure.Services.BackgroundJobs;
using ResearchLms.Billing.Infrastructure.Services.ReportServices;
using ResearchLms.Billing.Infrastructure.Persistence.Repositories;
using ResearchLms.Billing.Infrastructure.Services;
using ResearchLms.Billing.Infrastructure.Services.WidgetDataSources;
using ResearchLms.Infrastructure.Contexts;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddBillingInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddMemoryCache();
        services.AddScoped<ITenantContext, TenantContext>();

        services.AddDbContext<BillingDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("BillingDb")));

        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IRateTableRepository, RateTableRepository>();
        services.AddScoped<ICreditRepository, CreditRepository>();
        services.AddScoped<IPricingModelRepository, PricingModelRepository>();
        services.AddScoped<IExchangeRateRepository, ExchangeRateRepository>();
        services.AddScoped<IPaymentReconciliationRepository, PaymentReconciliationRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();
        services.AddScoped<IReportScheduleRepository, ReportScheduleRepository>();
        services.AddScoped<IAggregationRepository, AggregationRepository>();

        services.AddScoped<IInvoiceGenerationService, InvoiceGenerationService>();
        services.AddScoped<IInvoicePdfService, InvoicePdfService>();
        services.AddScoped<IPricingService, PricingService>();
        services.AddScoped<ITaxService, TaxService>();
        services.AddScoped<IRebateService, RebateService>();
        services.AddScoped<IErpIntegrationService, OracleFusionErpService>();
        services.AddScoped<ICurrencyService, CurrencyService>();

        services.AddScoped<IWidgetDataSourceResolver, WidgetDataSourceResolver>();
        services.AddScoped<IWidgetDataSource, KpiDataSource>();
        services.AddScoped<IWidgetDataSource, ChartDataSource>();
        services.AddScoped<IWidgetDataSource, MockWidgetDataSource>();

        services.AddScoped<IReportRepository, ReportRepository>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IInstrument365Service, Instrument365AggregationService>();
        services.AddSingleton<DynamicQueryBuilder>();

        services.AddTransient<CsvExportService>();
        services.AddTransient<ExcelExportService>();
        services.AddTransient<PdfExportService>();
        services.AddTransient<IReportExportService, ReportExportService>();

        services.AddScoped<ReportExecutionJob>();
        services.AddScoped<DailyRollupJob>();
        services.AddScoped<WeeklyRollupJob>();
        services.AddScoped<MonthlyRollupJob>();

        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
        if (env != "Testing")
        {
            services.AddHangfire(cfg =>
                cfg.UseSqlServerStorage(configuration.GetConnectionString("BillingDb")));
            services.AddHangfireServer();
        }

        return services;
    }
}
