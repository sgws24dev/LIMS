using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class IoTTelemetryConfiguration : IEntityTypeConfiguration<IoTTelemetry>
{
    public void Configure(EntityTypeBuilder<IoTTelemetry> builder)
    {
        builder.ToTable("IoTTelemetry");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.MetricName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Unit).HasMaxLength(50);
        builder.Property(e => e.Tags).HasMaxLength(4000);
        builder.HasIndex(e => new { e.TenantId, e.InstrumentId, e.Timestamp });
    }
}
