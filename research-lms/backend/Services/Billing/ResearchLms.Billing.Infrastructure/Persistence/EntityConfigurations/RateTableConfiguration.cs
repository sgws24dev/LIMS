using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class RateTableConfiguration : IEntityTypeConfiguration<RateTable>
{
    public void Configure(EntityTypeBuilder<RateTable> builder)
    {
        builder.ToTable("RateTables");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.CustomerType).HasMaxLength(50).IsRequired().HasConversion<string>();

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();

        builder.HasIndex(e => e.PricingModelId);
    }
}
