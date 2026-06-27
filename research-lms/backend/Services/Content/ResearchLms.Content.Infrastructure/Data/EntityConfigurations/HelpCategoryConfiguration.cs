using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Infrastructure.Data.EntityConfigurations;

public class HelpCategoryConfiguration : IEntityTypeConfiguration<HelpCategory>
{
    public void Configure(EntityTypeBuilder<HelpCategory> builder)
    {
        builder.ToTable("HelpCategories");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Slug)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.SortOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.HasIndex(c => c.Slug);
        builder.HasIndex(c => new { c.TenantId, c.ParentCategoryId });
    }
}
