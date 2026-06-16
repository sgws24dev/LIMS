using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class InstitutionSettingsConfiguration : IEntityTypeConfiguration<InstitutionSettings>
{
    public void Configure(EntityTypeBuilder<InstitutionSettings> builder)
    {
        builder.ToTable("InstitutionSettings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.LogoUrl).HasMaxLength(500);
        builder.Property(x => x.PrimaryColor).HasMaxLength(50);
        builder.Property(x => x.Timezone).HasMaxLength(100);
        builder.Property(x => x.DateFormat).HasMaxLength(20);
        builder.Property(x => x.CustomSettings)
            .HasColumnType("nvarchar(max)")
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, string>());
        builder.HasIndex(x => x.TenantId).IsUnique();
    }
}
