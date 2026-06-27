using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Infrastructure.Data.EntityConfigurations;

public class PublicationConfiguration : IEntityTypeConfiguration<Publication>
{
    public void Configure(EntityTypeBuilder<Publication> builder)
    {
        builder.ToTable("Publications");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(p => p.AuthorsJson)
            .HasColumnName("Authors")
            .IsRequired();

        builder.Property(p => p.Journal)
            .HasMaxLength(500);

        builder.Property(p => p.Doi)
            .HasMaxLength(300);

        builder.Property(p => p.PmId)
            .HasMaxLength(50);

        builder.Property(p => p.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.Link)
            .HasMaxLength(2000);

        builder.Property(p => p.AttachmentsJson)
            .HasColumnName("Attachments");

        builder.Property(p => p.IsVerified)
            .IsRequired()
            .HasDefaultValue(false);

        builder.HasIndex(p => p.Doi).IsUnique().HasFilter("[Doi] IS NOT NULL");
        builder.HasIndex(p => new { p.TenantId, p.Type });
        builder.HasIndex(p => new { p.TenantId, p.PublicationDate });
    }
}
