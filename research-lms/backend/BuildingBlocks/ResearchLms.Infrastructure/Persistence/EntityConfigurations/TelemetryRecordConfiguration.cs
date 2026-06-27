using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class TelemetryRecordConfiguration : IEntityTypeConfiguration<TelemetryRecord>
{
    public void Configure(EntityTypeBuilder<TelemetryRecord> builder)
    {
        builder.ToTable("TelemetryRecords");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.InstrumentId).IsRequired();
        builder.Property(x => x.Source).HasMaxLength(100);
        builder.Property(x => x.ValidationNotes).HasMaxLength(500);

        builder.Property(x => x.Metrics)
            .HasConversion(new JsonValueConverter<Dictionary<string, double>>())
            .HasColumnType("nvarchar(max)");

        builder.HasOne(x => x.Instrument)
            .WithMany()
            .HasForeignKey(x => x.InstrumentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.InstrumentId, x.ReceivedAt }).IsDescending(false, false, true);
        builder.HasIndex(x => new { x.TenantId, x.IsValid });
    }
}
