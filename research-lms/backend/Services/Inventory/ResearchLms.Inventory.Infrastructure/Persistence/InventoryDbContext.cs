using Microsoft.EntityFrameworkCore;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Inventory.Infrastructure.Persistence;

public class InventoryDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    public InventoryDbContext(DbContextOptions<InventoryDbContext> options, ITenantContext? tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderLine> PurchaseOrderLines => Set<PurchaseOrderLine>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InventoryDbContext).Assembly);

        if (_tenantContext?.TenantId is not null)
        {
            modelBuilder.Entity<InventoryItem>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<Vendor>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<PurchaseOrder>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<PurchaseOrderLine>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<StockTransaction>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        }

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
