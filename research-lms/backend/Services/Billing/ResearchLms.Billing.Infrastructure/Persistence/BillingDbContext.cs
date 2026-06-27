using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Infrastructure.Persistence;

public class BillingDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    public BillingDbContext(DbContextOptions<BillingDbContext> options, ITenantContext? tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();
    public DbSet<InvoiceSequence> InvoiceSequences => Set<InvoiceSequence>();
    public DbSet<PricingModel> PricingModels => Set<PricingModel>();
    public DbSet<RateTable> RateTables => Set<RateTable>();
    public DbSet<Rebate> Rebates => Set<Rebate>();
    public DbSet<Credit> Credits => Set<Credit>();
    public DbSet<TaxCode> TaxCodes => Set<TaxCode>();
    public DbSet<ErpSyncLog> ErpSyncLogs => Set<ErpSyncLog>();
    public DbSet<ExchangeRate> ExchangeRates => Set<ExchangeRate>();
    public DbSet<PaymentReconciliation> PaymentReconciliations => Set<PaymentReconciliation>();
    public DbSet<DashboardDefinition> DashboardDefinitions => Set<DashboardDefinition>();
    public DbSet<DashboardWidget> DashboardWidgets => Set<DashboardWidget>();
    public DbSet<ReportDefinition> ReportDefinitions => Set<ReportDefinition>();
    public DbSet<ReportSchedule> ReportSchedules => Set<ReportSchedule>();
    public DbSet<AggregationTable> AggregationTables => Set<AggregationTable>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BillingDbContext).Assembly);

        if (_tenantContext?.TenantId is not null)
        {
            modelBuilder.Entity<Invoice>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<InvoiceLineItem>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<InvoiceSequence>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<PricingModel>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<RateTable>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<Rebate>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<Credit>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<TaxCode>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<ErpSyncLog>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<ExchangeRate>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<PaymentReconciliation>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<DashboardDefinition>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<DashboardWidget>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<ReportDefinition>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<ReportSchedule>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<AggregationTable>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        }

        modelBuilder.Entity<Invoice>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<InvoiceLineItem>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<InvoiceSequence>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<PricingModel>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<RateTable>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Rebate>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Credit>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<TaxCode>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ErpSyncLog>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ExchangeRate>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<PaymentReconciliation>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<DashboardDefinition>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<DashboardWidget>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ReportDefinition>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ReportSchedule>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<AggregationTable>().HasQueryFilter(e => !e.IsDeleted);

        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added && _tenantContext?.TenantId is not null)
            {
                entry.Entity.SetTenant(_tenantContext.TenantId);
            }
        }

        return base.SaveChangesAsync(ct);
    }
}
