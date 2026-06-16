using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Scheduling.Domain.Entities;

namespace ResearchLms.Scheduling.Infrastructure.Persistence.EntityConfigurations;

public class BookingResourceConfiguration : IEntityTypeConfiguration<BookingResource>
{
    public void Configure(EntityTypeBuilder<BookingResource> builder)
    {
        builder.ToTable("BookingResources");

        builder.HasKey(r => r.ResourceId);

        builder.Property(r => r.Name).HasMaxLength(200).IsRequired();
        builder.Property(r => r.Identifier).HasMaxLength(100).IsRequired();
        builder.Property(r => r.Location).HasMaxLength(200);
        builder.Property(r => r.FacilityName).HasMaxLength(200);

        builder.Property(r => r.ResourceType)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(r => r.HourlyRate)
            .HasColumnType("decimal(18,2)")
            .HasDefaultValue(0);

        builder.HasIndex(r => new { r.TenantId, r.ResourceType });
        builder.HasIndex(r => r.Name);
    }
}
