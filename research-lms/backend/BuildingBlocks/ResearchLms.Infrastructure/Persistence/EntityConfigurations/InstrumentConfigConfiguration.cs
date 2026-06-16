using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class InstrumentConfigConfiguration : IEntityTypeConfiguration<InstrumentConfig>
{
    public void Configure(EntityTypeBuilder<InstrumentConfig> builder)
    {
        builder.ToTable("InstrumentConfigs");
        builder.HasKey(x => x.InstrumentId);

        builder.Property(x => x.ConnectionString).HasMaxLength(500);
        builder.Property(x => x.AuthToken).HasMaxLength(500);

        builder.Property(x => x.MetricKeys)
            .HasConversion(new JsonValueConverter<List<string>>())
            .HasColumnType("nvarchar(max)");
    }
}
