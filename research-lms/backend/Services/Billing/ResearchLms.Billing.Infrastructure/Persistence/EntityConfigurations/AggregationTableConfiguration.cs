using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Infrastructure.Persistence.EntityConfigurations;

public class AggregationTableConfiguration : IEntityTypeConfiguration<AggregationTable>
{
    public void Configure(EntityTypeBuilder<AggregationTable> builder)
    {
        builder.ToTable("AggregationTables");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Granularity).IsRequired();
        builder.Property(e => e.DateKey).IsRequired();
        builder.Property(e => e.MetricName).HasMaxLength(200).IsRequired();
        builder.Property(e => e.MetricValue).HasPrecision(18, 4).IsRequired();

        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.Property(e => e.DeletedBy).HasMaxLength(100);

        builder.HasIndex(e => new { e.TenantId, e.Granularity, e.DateKey, e.MetricName }).IsUnique();
    }
}
