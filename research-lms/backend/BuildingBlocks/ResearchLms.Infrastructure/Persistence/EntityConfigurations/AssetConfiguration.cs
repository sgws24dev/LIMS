using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ResearchLms.Shared.Domain.Entities;
using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("Assets", tb => tb.IsTemporal(t =>
        {
            t.HasPeriodStart("ValidFrom");
            t.HasPeriodEnd("ValidTo");
            t.UseHistoryTable("AssetsHistory");
        }));
        builder.HasKey(x => x.Id);

        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Identifier).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Category).IsRequired().HasMaxLength(100);
        builder.Property(x => x.AssetType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Model).HasMaxLength(200);
        builder.Property(x => x.Manufacturer).HasMaxLength(200);
        builder.Property(x => x.Location).HasMaxLength(300);
        builder.Property(x => x.QrCode).HasMaxLength(500);
        builder.Property(x => x.RfidTag).HasMaxLength(100);
        builder.Property(x => x.AcquisitionCost).HasColumnType("decimal(18,2)");
        builder.Property(x => x.CurrentValue).HasColumnType("decimal(18,2)");
        builder.Property(x => x.SalvageValue).HasColumnType("decimal(18,2)");

        builder.Property(x => x.CustomFields)
            .HasConversion(new JsonValueConverter<Dictionary<string, string>>())
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.DepreciationMethod)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasDiscriminator<string>("AssetType");

        builder.HasOne(x => x.Facility)
            .WithMany()
            .HasForeignKey(x => x.FacilityId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.Identifier }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.FacilityId, x.Status });
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.FacilityId);
    }
}

public class JsonValueConverter<T> : ValueConverter<T, string> where T : new()
{
    public JsonValueConverter()
        : base(
            v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
            v => System.Text.Json.JsonSerializer.Deserialize<T>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new())
    {
    }
}
