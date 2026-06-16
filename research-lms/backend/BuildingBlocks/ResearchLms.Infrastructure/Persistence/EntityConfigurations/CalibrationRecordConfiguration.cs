using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class CalibrationRecordConfiguration : IEntityTypeConfiguration<CalibrationRecord>
{
    public void Configure(EntityTypeBuilder<CalibrationRecord> builder)
    {
        builder.ToTable("CalibrationRecords");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.InstrumentId).IsRequired();
        builder.Property(x => x.PerformedBy).IsRequired().HasMaxLength(200);
        builder.Property(x => x.PerformedByOrganization).HasMaxLength(300);
        builder.Property(x => x.CertificateRef).HasMaxLength(200);
        builder.Property(x => x.Notes).HasMaxLength(2000);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50).IsRequired();

        builder.HasOne(x => x.Instrument)
            .WithMany(x => x.CalibrationRecords)
            .HasForeignKey(x => x.InstrumentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.InstrumentId, x.NextDueDate });
        builder.HasIndex(x => new { x.TenantId, x.Status });
    }
}
