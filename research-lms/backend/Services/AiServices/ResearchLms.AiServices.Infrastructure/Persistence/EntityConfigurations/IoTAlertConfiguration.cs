using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class IoTAlertConfiguration : IEntityTypeConfiguration<IoTAlert>
{
    public void Configure(EntityTypeBuilder<IoTAlert> builder)
    {
        builder.ToTable("IoTAlerts");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.MetricName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Severity).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Status).HasMaxLength(50).IsRequired();
        builder.HasIndex(e => new { e.TenantId, e.InstrumentId, e.Status });
    }
}
