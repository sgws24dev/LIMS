using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class TaxCodeConfiguration : IEntityTypeConfiguration<TaxCode>
{
    public void Configure(EntityTypeBuilder<TaxCode> builder)
    {
        builder.ToTable("TaxCodes");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500);
        builder.Property(e => e.Country).HasMaxLength(3).IsRequired();
        builder.Property(e => e.Region).HasMaxLength(100);

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.Country, e.Region });
    }
}
