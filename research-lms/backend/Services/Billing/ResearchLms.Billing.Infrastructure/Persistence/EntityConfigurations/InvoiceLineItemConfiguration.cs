using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class InvoiceLineItemConfiguration : IEntityTypeConfiguration<InvoiceLineItem>
{
    public void Configure(EntityTypeBuilder<InvoiceLineItem> builder)
    {
        builder.ToTable("InvoiceLineItems");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500).IsRequired();
        builder.Property(e => e.ReferenceType).HasMaxLength(100);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();

        builder.HasIndex(e => e.InvoiceId);
    }
}
