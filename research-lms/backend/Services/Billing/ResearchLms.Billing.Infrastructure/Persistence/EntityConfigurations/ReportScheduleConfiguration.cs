using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class ReportScheduleConfiguration : IEntityTypeConfiguration<ReportSchedule>
{
    public void Configure(EntityTypeBuilder<ReportSchedule> builder)
    {
        builder.ToTable("ReportSchedules");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.ReportDefinitionId).IsRequired();
        builder.Property(e => e.CronExpression).HasMaxLength(100).IsRequired();
        builder.Property(e => e.TimeZoneId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Format).IsRequired();
        builder.Property(e => e.Recipients).IsRequired();
        builder.Property(e => e.Subject).HasMaxLength(500).IsRequired();
        builder.Property(e => e.IsActive).IsRequired();
        builder.Property(e => e.LastDeliveredAt);
        builder.Property(e => e.NextRunAt);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.Property(e => e.DeletedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.ReportDefinitionId });
        builder.HasIndex(e => new { e.TenantId, e.IsActive });

        builder.HasOne(e => e.ReportDefinition)
            .WithMany()
            .HasForeignKey(e => e.ReportDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
