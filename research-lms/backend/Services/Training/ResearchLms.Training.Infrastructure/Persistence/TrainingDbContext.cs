using Microsoft.EntityFrameworkCore;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Training.Domain.Entities;

namespace ResearchLms.Training.Infrastructure.Persistence;

public class TrainingDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    public TrainingDbContext(
        DbContextOptions<TrainingDbContext> options,
        ITenantContext? tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Competency> Competencies => Set<Competency>();
    public DbSet<UserCompetency> UserCompetencies => Set<UserCompetency>();
    public DbSet<PrerequisiteRule> PrerequisiteRules => Set<PrerequisiteRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TrainingDbContext).Assembly);

        if (_tenantContext?.TenantId is not null && _tenantContext.TenantId != Guid.Empty)
        {
            modelBuilder.Entity<Competency>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<UserCompetency>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<PrerequisiteRule>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        }

        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        var tenantId = _tenantContext?.TenantId;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added && tenantId is not null && tenantId != Guid.Empty)
            {
                entry.Entity.SetTenant(tenantId.Value);
            }
        }

        return base.SaveChangesAsync(ct);
    }
}
