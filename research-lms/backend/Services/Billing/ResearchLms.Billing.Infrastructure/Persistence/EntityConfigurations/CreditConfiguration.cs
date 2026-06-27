using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class CreditConfiguration : IEntityTypeConfiguration<Credit>
{
    public void Configure(EntityTypeBuilder<Credit> builder)
    {
        builder.ToTable("Credits");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Currency).HasMaxLength(3).IsRequired();

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.InstitutionId }).IsUnique();
    }
}
