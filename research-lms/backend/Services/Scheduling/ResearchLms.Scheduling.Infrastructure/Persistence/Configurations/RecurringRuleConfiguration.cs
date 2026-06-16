using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Infrastructure.Persistence.Configurations;

public class RecurringRuleConfiguration : IEntityTypeConfiguration<RecurringRule>
{
    public void Configure(EntityTypeBuilder<RecurringRule> builder)
    {
        builder.ToTable("RecurringRules");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.TenantId).IsRequired();
        builder.Property(r => r.ResourceId).IsRequired();
        builder.Property(r => r.ResourceType)
            .HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(r => r.UserId).IsRequired();
        builder.Property(r => r.UserName).HasMaxLength(200).IsRequired();
        builder.Property(r => r.Title).HasMaxLength(300).IsRequired();
        builder.Property(r => r.Purpose).HasMaxLength(1000);
        builder.Property(r => r.Notes).HasMaxLength(2000);

        builder.Property(r => r.Frequency)
            .HasConversion<string>().HasMaxLength(20).IsRequired();

        builder.Property(r => r.DayOfWeekMask).IsRequired();
        builder.Property(r => r.TimeOfDay).HasColumnType("time").IsRequired();
        builder.Property(r => r.DurationMinutes).IsRequired();
        builder.Property(r => r.EffectiveFrom).IsRequired();
        builder.Property(r => r.EffectiveTo);

        builder.Property(r => r.MaxInstances);
        builder.Property(r => r.Status)
            .HasConversion<string>().HasMaxLength(20).IsRequired();

        builder.Property(r => r.LastGeneratedDate);
        builder.Property(r => r.GeneratedCount).IsRequired().HasDefaultValue(0);

        builder.HasMany(r => r.Bookings)
            .WithOne(b => b.RecurringRule)
            .HasForeignKey(b => b.RecurringRuleId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(r => new { r.TenantId, r.ResourceId, r.Status });
        builder.HasIndex(r => new { r.TenantId, r.UserId, r.Status });
    }
}
