using Microsoft.EntityFrameworkCore;
using ResearchLms.Communications.Domain.Entities;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Infrastructure.Persistence;

public class CommunicationsDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    public CommunicationsDbContext(
        DbContextOptions<CommunicationsDbContext> options,
        ITenantContext? tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();
    public DbSet<Announcement> Announcements => Set<Announcement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CommunicationsDbContext).Assembly);

        if (_tenantContext?.TenantId is not null && _tenantContext.TenantId != Guid.Empty)
        {
            modelBuilder.Entity<Notification>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<NotificationTemplate>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<NotificationPreference>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<Announcement>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
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
