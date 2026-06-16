using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Infrastructure.Persistence.Configurations;

public class CalendarSyncLogConfiguration : IEntityTypeConfiguration<CalendarSyncLog>
{
    public void Configure(EntityTypeBuilder<CalendarSyncLog> builder)
    {
        builder.ToTable("CalendarSyncLogs");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.CalendarConnectionId).IsRequired();
        builder.Property(l => l.TenantId).IsRequired();
        builder.Property(l => l.UserId).IsRequired();
        builder.Property(l => l.Provider).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(l => l.Direction).HasMaxLength(30).IsRequired();
        builder.Property(l => l.Status).HasMaxLength(20).IsRequired();
        builder.Property(l => l.EventsCreated).IsRequired().HasDefaultValue(0);
        builder.Property(l => l.EventsUpdated).IsRequired().HasDefaultValue(0);
        builder.Property(l => l.EventsDeleted).IsRequired().HasDefaultValue(0);
        builder.Property(l => l.ErrorMessage).HasMaxLength(2000);
        builder.Property(l => l.SyncedAt).IsRequired();

        builder.HasIndex(l => new { l.TenantId, l.UserId, l.SyncedAt }).IsDescending(false, false, true);

        builder.HasOne(l => l.CalendarConnection)
            .WithMany(c => c.SyncLogs)
            .HasForeignKey(l => l.CalendarConnectionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
