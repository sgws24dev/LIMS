using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Infrastructure.Data.EntityConfigurations;

public class HomepageDefinitionConfiguration : IEntityTypeConfiguration<HomepageDefinition>
{
    public void Configure(EntityTypeBuilder<HomepageDefinition> builder)
    {
        builder.ToTable("HomepageDefinitions");

        builder.HasKey(h => h.Id);

        builder.Property(h => h.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(h => h.IsActive)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(h => h.LayoutJson)
            .HasColumnName("Layout")
            .IsRequired();

        builder.HasIndex(h => new { h.TenantId, h.IsActive });
    }
}
