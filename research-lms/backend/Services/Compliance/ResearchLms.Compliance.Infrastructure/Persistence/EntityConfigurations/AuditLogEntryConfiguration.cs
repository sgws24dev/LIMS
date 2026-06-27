using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Compliance.Domain.Entities;

namespace ResearchLms.Compliance.Infrastructure.Persistence.EntityConfigurations;

public class AuditLogEntryConfiguration : IEntityTypeConfiguration<AuditLogEntry>
{
    public void Configure(EntityTypeBuilder<AuditLogEntry> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.EntityType).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Operation).HasMaxLength(50).IsRequired();
        builder.Property(e => e.PreviousValues).HasColumnType("nvarchar(max)");
        builder.Property(e => e.NewValues).HasColumnType("nvarchar(max)");
        builder.Property(e => e.ChangedByUserId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.ChangedByUserName).HasMaxLength(200).IsRequired();
        builder.Property(e => e.ChangeReason).HasMaxLength(1000).IsRequired();
        builder.Property(e => e.IpAddress).HasMaxLength(50);
        builder.Property(e => e.UserAgent).HasMaxLength(500);
        builder.Property(e => e.PreviousHash).HasMaxLength(64);
        builder.Property(e => e.CurrentHash).HasMaxLength(64).IsRequired();

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.EntityType, e.EntityId, e.Timestamp });
        builder.HasIndex(e => new { e.TenantId, e.ChangedByUserId });
    }
}
