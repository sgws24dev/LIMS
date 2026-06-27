using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Infrastructure.Persistence;

public class AiServicesDbContext : DbContext
{
    private readonly ITenantContext _tenantContext;

    public AiServicesDbContext(DbContextOptions<AiServicesDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<HelpdeskConversation> HelpdeskConversations => Set<HelpdeskConversation>();
    public DbSet<HelpdeskMessage> HelpdeskMessages => Set<HelpdeskMessage>();
    public DbSet<HelpdeskTicket> HelpdeskTickets => Set<HelpdeskTicket>();
    public DbSet<McpToolLog> McpToolLogs => Set<McpToolLog>();
    public DbSet<ActionLog> ActionLogs => Set<ActionLog>();
    public DbSet<IoTTelemetry> IoTTelemetry => Set<IoTTelemetry>();
    public DbSet<IoTAlert> IoTAlerts => Set<IoTAlert>();
    public DbSet<IoTRule> IoTRules => Set<IoTRule>();
    public DbSet<AutomationRule> AutomationRules => Set<AutomationRule>();
    public DbSet<AutomationActionLog> AutomationActionLogs => Set<AutomationActionLog>();
    public DbSet<InstrumentApiKey> InstrumentApiKeys => Set<InstrumentApiKey>();
    public DbSet<GuardrailConfig> GuardrailConfigs => Set<GuardrailConfig>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AiServicesDbContext).Assembly);

        modelBuilder.Entity<HelpdeskConversation>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<HelpdeskMessage>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<HelpdeskTicket>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<McpToolLog>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<ActionLog>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<IoTTelemetry>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<IoTAlert>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<IoTRule>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<AutomationRule>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<AutomationActionLog>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<InstrumentApiKey>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<GuardrailConfig>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
    }
}
