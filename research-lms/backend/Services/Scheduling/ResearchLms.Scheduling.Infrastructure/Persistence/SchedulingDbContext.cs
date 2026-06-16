using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;

namespace ResearchLms.Scheduling.Infrastructure.Persistence;

public class SchedulingDbContext : DbContext
{
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<BookingResource> BookingResources { get; set; }
    public DbSet<ResourceOperatingHours> ResourceOperatingHours { get; set; }
    public DbSet<MaintenanceWindow> MaintenanceWindows { get; set; }
    public DbSet<Constraint> Constraints { get; set; }
    public DbSet<WaitlistEntry> WaitlistEntries { get; set; }
    public DbSet<RecurringRule> RecurringRules { get; set; }
    public DbSet<UserCompetencyCache> UserCompetencyCache { get; set; }
    public DbSet<ConsumableStockCache> ConsumableStockCache { get; set; }
    public DbSet<CalendarConnection> CalendarConnections { get; set; }
    public DbSet<CalendarSyncLog> CalendarSyncLogs { get; set; }
    public DbSet<CalendarEventMapping> CalendarEventMappings { get; set; }
    public DbSet<TrainerAvailability> TrainerAvailability { get; set; }

    public SchedulingDbContext(DbContextOptions<SchedulingDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SchedulingDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
