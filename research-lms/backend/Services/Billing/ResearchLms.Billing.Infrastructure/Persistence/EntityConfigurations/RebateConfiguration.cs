using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class RebateConfiguration : IEntityTypeConfiguration<Rebate>
{
    public void Configure(EntityTypeBuilder<Rebate> builder)
    {
        builder.ToTable("Rebates");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(1000);
        builder.Property(e => e.RebateType).HasMaxLength(50).IsRequired().HasConversion<string>();

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
    }
}
