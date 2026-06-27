using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.InvoiceNumber).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Status).HasMaxLength(50).IsRequired().HasConversion<string>();
        builder.Property(e => e.BilledToEntityType).HasMaxLength(50).IsRequired().HasConversion<string>();
        builder.Property(e => e.BillToName).HasMaxLength(200).IsRequired();
        builder.Property(e => e.BillToAddress).HasMaxLength(500).IsRequired();
        builder.Property(e => e.BillToEmail).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Currency).HasMaxLength(3).IsRequired();
        builder.Property(e => e.ErpSyncStatus).HasMaxLength(50).IsRequired().HasConversion<string>();

        builder.Property(e => e.VoidReason).HasMaxLength(1000);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.Property(e => e.DeletedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.InvoiceNumber }).IsUnique();
        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => new { e.TenantId, e.BilledToEntityType, e.BilledToEntityId });

        builder.HasMany(e => e.LineItems)
            .WithOne(e => e.Invoice)
            .HasForeignKey(e => e.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
