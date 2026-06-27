using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class ErpSyncLogConfiguration : IEntityTypeConfiguration<ErpSyncLog>
{
    public void Configure(EntityTypeBuilder<ErpSyncLog> builder)
    {
        builder.ToTable("ErpSyncLogs");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Direction).HasMaxLength(20).IsRequired();
        builder.Property(e => e.Status).HasMaxLength(50).IsRequired().HasConversion<string>();
        builder.Property(e => e.RequestPayload).HasColumnType("nvarchar(max)");
        builder.Property(e => e.ResponsePayload).HasColumnType("nvarchar(max)");
        builder.Property(e => e.ErrorMessage).HasMaxLength(2000);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.InvoiceId });
        builder.HasIndex(e => new { e.TenantId, e.Status });
    }
}
