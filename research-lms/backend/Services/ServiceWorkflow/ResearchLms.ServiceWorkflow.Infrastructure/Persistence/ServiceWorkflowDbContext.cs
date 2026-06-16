using Microsoft.EntityFrameworkCore;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Persistence;

public class ServiceWorkflowDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    public ServiceWorkflowDbContext(DbContextOptions<ServiceWorkflowDbContext> options, ITenantContext? tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<FormDefinition> FormDefinitions => Set<FormDefinition>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<RequestMilestone> RequestMilestones => Set<RequestMilestone>();
    public DbSet<Approval> Approvals => Set<Approval>();
    public DbSet<RequestStatusHistory> RequestStatusHistories => Set<RequestStatusHistory>();
    public DbSet<WorkflowDefinition> WorkflowDefinitions => Set<WorkflowDefinition>();
    public DbSet<WorkflowInstance> WorkflowInstances => Set<WorkflowInstance>();
    public DbSet<NotificationRule> NotificationRules => Set<NotificationRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ServiceWorkflowDbContext).Assembly);

        if (_tenantContext?.TenantId is not null)
        {
            modelBuilder.Entity<FormDefinition>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<ServiceRequest>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<RequestMilestone>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<Approval>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<RequestStatusHistory>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<WorkflowDefinition>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<WorkflowInstance>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<NotificationRule>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        }

        // Global soft-delete filter
        modelBuilder.Entity<FormDefinition>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ServiceRequest>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<RequestMilestone>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Approval>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<RequestStatusHistory>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<WorkflowDefinition>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<WorkflowInstance>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<NotificationRule>().HasQueryFilter(e => !e.IsDeleted);

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
