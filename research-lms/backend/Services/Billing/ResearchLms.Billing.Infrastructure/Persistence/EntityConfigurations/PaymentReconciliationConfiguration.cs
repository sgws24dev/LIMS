using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class PaymentReconciliationConfiguration : IEntityTypeConfiguration<PaymentReconciliation>
{
    public void Configure(EntityTypeBuilder<PaymentReconciliation> builder)
    {
        builder.ToTable("PaymentReconciliations");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ReferenceNumber).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Currency).HasMaxLength(3).IsRequired();
        builder.Property(e => e.Notes).HasMaxLength(1000);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);

        builder.HasOne(e => e.Invoice)
            .WithMany()
            .HasForeignKey(e => e.InvoiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => new { e.TenantId, e.InvoiceId });
        builder.HasIndex(e => new { e.TenantId, e.ReferenceNumber });
    }
}
