using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Infrastructure.Data.EntityConfigurations;

public class HelpArticleConfiguration : IEntityTypeConfiguration<HelpArticle>
{
    public void Configure(EntityTypeBuilder<HelpArticle> builder)
    {
        builder.ToTable("HelpArticles");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.Slug)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.Content)
            .IsRequired();

        builder.Property(a => a.TagsJson)
            .HasColumnName("Tags")
            .IsRequired();

        builder.Property(a => a.IsPublished)
            .IsRequired();

        builder.Property(a => a.ViewCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.HasIndex(a => a.Slug);
        builder.HasIndex(a => new { a.TenantId, a.CategoryId });
        builder.HasIndex(a => new { a.TenantId, a.IsPublished });
    }
}
