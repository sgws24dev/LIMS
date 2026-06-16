using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.Shared.Domain.Entities;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Infrastructure.Persistence;

public class ResearchLmsDbContext : DbContext, IUnitOfWork
{
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;
    private readonly IServiceProvider _serviceProvider;

    public ResearchLmsDbContext(
        DbContextOptions<ResearchLmsDbContext> options,
        ITenantContext tenantContext,
        ICurrentUser currentUser,
        IServiceProvider serviceProvider) : base(options)
    {
        _tenantContext = tenantContext;
        _currentUser = currentUser;
        _serviceProvider = serviceProvider;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<AbacRule> AbacRules => Set<AbacRule>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<InstitutionSettings> InstitutionSettings => Set<InstitutionSettings>();
    public DbSet<Facility> Facilities => Set<Facility>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Instrument> Instruments => Set<Instrument>();
    public DbSet<InstrumentConfig> InstrumentConfigs => Set<InstrumentConfig>();
    public DbSet<MaintenanceRecord> MaintenanceRecords => Set<MaintenanceRecord>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<CalibrationRecord> CalibrationRecords => Set<CalibrationRecord>();
    public DbSet<CustodyEvent> CustodyEvents => Set<CustodyEvent>();
    public DbSet<TelemetryRecord> TelemetryRecords => Set<TelemetryRecord>();
 
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ResearchLmsDbContext).Assembly);

        builder.Entity<User>().HasQueryFilter(u => !u.IsDeleted && u.TenantId == _tenantContext.TenantId);
        builder.Entity<Tenant>().HasQueryFilter(t => !t.IsDeleted);
        builder.Entity<Role>().HasQueryFilter(r => !r.IsDeleted && r.TenantId == _tenantContext.TenantId);
        builder.Entity<Permission>().HasQueryFilter(p => !p.IsDeleted);
        builder.Entity<AbacRule>().HasQueryFilter(a => !a.IsDeleted && a.TenantId == _tenantContext.TenantId);
        builder.Entity<RefreshToken>().HasQueryFilter(rt => !rt.IsDeleted);
        builder.Entity<UserRole>().HasQueryFilter(ur => !ur.IsDeleted);
        builder.Entity<Facility>().HasQueryFilter(f => !f.IsDeleted && f.TenantId == _tenantContext.TenantId);
        builder.Entity<Room>().HasQueryFilter(r => !r.IsDeleted && r.TenantId == _tenantContext.TenantId);
        builder.Entity<Asset>().HasQueryFilter(a => !a.IsDeleted && a.TenantId == _tenantContext.TenantId);
        builder.Entity<MaintenanceRecord>().HasQueryFilter(m => !m.IsDeleted && m.TenantId == _tenantContext.TenantId);
        builder.Entity<WorkOrder>().HasQueryFilter(w => !w.IsDeleted && w.TenantId == _tenantContext.TenantId);
        builder.Entity<CalibrationRecord>().HasQueryFilter(c => !c.IsDeleted && c.TenantId == _tenantContext.TenantId);
        builder.Entity<CustodyEvent>().HasQueryFilter(c => !c.IsDeleted && c.TenantId == _tenantContext.TenantId);
        builder.Entity<TelemetryRecord>().HasQueryFilter(t => !t.IsDeleted && t.TenantId == _tenantContext.TenantId);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.SetTenant(_tenantContext.TenantId);
                    entry.Entity.MarkCreated(_currentUser.Name);
                    break;
                case EntityState.Modified:
                    entry.Entity.MarkUpdated(_currentUser.Name);
                    break;
            }
        }

        var result = await base.SaveChangesAsync(ct);

        var domainEvents = ChangeTracker.Entries<BaseEntity>()
            .SelectMany(e => e.Entity.DomainEvents)
            .ToList();

        if (domainEvents.Count > 0)
        {
            var mediator = _serviceProvider.GetRequiredService<IMediator>();
            foreach (var domainEvent in domainEvents)
            {
                await mediator.Publish(domainEvent, ct);
            }
        }

        return result;
    }
}
