using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class InvoiceSequenceConfiguration : IEntityTypeConfiguration<InvoiceSequence>
{
    public void Configure(EntityTypeBuilder<InvoiceSequence> builder)
    {
        builder.ToTable("InvoiceSequences");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();

        builder.HasIndex(e => new { e.TenantId, e.Year }).IsUnique();
    }
}
