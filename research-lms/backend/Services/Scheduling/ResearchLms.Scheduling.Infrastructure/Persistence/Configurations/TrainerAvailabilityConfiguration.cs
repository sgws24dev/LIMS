using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Infrastructure.Persistence.Configurations;

public class TrainerAvailabilityConfiguration : IEntityTypeConfiguration<TrainerAvailability>
{
    public void Configure(EntityTypeBuilder<TrainerAvailability> builder)
    {
        builder.ToTable("TrainerAvailability");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TenantId).IsRequired();
        builder.Property(t => t.UserId).IsRequired();
        builder.Property(t => t.UserName).HasMaxLength(200).IsRequired();
        builder.Property(t => t.DayOfWeek).HasConversion<string>().HasMaxLength(10).IsRequired();
        builder.Property(t => t.StartTime).HasColumnType("time").IsRequired();
        builder.Property(t => t.EndTime).HasColumnType("time").IsRequired();
        builder.Property(t => t.IsAvailable).IsRequired();
        builder.Property(t => t.EffectiveFrom).IsRequired();
        builder.Property(t => t.EffectiveTo);
        builder.Property(t => t.Source).HasConversion<string>().HasMaxLength(20).IsRequired().HasDefaultValue(AvailabilitySource.Manual);
        builder.Property(t => t.ExternalEventId).HasMaxLength(500);
        builder.Property(t => t.Notes).HasMaxLength(500);

        builder.HasIndex(t => new { t.TenantId, t.UserId, t.DayOfWeek, t.IsAvailable });
        builder.HasIndex(t => new { t.TenantId, t.IsAvailable, t.DayOfWeek });
    }
}
