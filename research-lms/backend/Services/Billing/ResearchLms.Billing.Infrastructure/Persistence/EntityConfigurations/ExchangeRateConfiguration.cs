using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class ExchangeRateConfiguration : IEntityTypeConfiguration<ExchangeRate>
{
    public void Configure(EntityTypeBuilder<ExchangeRate> builder)
    {
        builder.ToTable("ExchangeRates");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.FromCurrency).HasMaxLength(3).IsRequired();
        builder.Property(e => e.ToCurrency).HasMaxLength(3).IsRequired();

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.FromCurrency, e.ToCurrency });
    }
}
