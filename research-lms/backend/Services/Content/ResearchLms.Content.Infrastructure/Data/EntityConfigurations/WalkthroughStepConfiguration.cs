using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Infrastructure.Data.EntityConfigurations;

public class WalkthroughStepConfiguration : IEntityTypeConfiguration<WalkthroughStep>
{
    public void Configure(EntityTypeBuilder<WalkthroughStep> builder)
    {
        builder.ToTable("WalkthroughSteps");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(s => s.Content)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(s => s.ElementSelector)
            .HasMaxLength(500);

        builder.Property(s => s.Placement)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(s => s.ActionType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasIndex(s => new { s.TenantId, s.WalkthroughId });
    }
}
