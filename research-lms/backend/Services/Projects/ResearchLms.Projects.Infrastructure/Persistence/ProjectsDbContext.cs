using Microsoft.EntityFrameworkCore;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Projects.Infrastructure.Persistence;

public class ProjectsDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    public ProjectsDbContext(DbContextOptions<ProjectsDbContext> options, ITenantContext? tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<CostCenter> CostCenters => Set<CostCenter>();
    public DbSet<Issue> Issues => Set<Issue>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProjectsDbContext).Assembly);

        if (_tenantContext?.TenantId is not null)
        {
            modelBuilder.Entity<Project>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<WorkOrder>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<CostCenter>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<Issue>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
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
