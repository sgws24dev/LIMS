using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Shared.Domain.Entities;
using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class InstrumentConfiguration : IEntityTypeConfiguration<Instrument>
{
    public void Configure(EntityTypeBuilder<Instrument> builder)
    {
        builder.HasBaseType<Asset>();
        builder.HasDiscriminator<string>("AssetType").HasValue<Instrument>("Instrument");

        builder.Property(x => x.IpAddress).HasMaxLength(45);
        builder.Property(x => x.Firmware).HasMaxLength(100);
        builder.Property(x => x.ConnectionProtocol)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasOne(x => x.InstrumentConfig)
            .WithOne(x => x.Instrument)
            .HasForeignKey<InstrumentConfig>(x => x.InstrumentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
