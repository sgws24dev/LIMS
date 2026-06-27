using Microsoft.EntityFrameworkCore;
using ResearchLms.Compliance.Domain.Entities;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Compliance.Infrastructure.Persistence;

public class ComplianceDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    public ComplianceDbContext(DbContextOptions<ComplianceDbContext> options, ITenantContext? tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<AuditLogEntry> AuditLogEntries => Set<AuditLogEntry>();
    public DbSet<Signature> Signatures => Set<Signature>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ComplianceDbContext).Assembly);

        if (_tenantContext?.TenantId is not null)
        {
            modelBuilder.Entity<AuditLogEntry>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<Signature>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        }

        modelBuilder.Entity<AuditLogEntry>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Signature>().HasQueryFilter(e => !e.IsDeleted);

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
