using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Infrastructure.Data.EntityConfigurations;

public class WalkthroughConfiguration : IEntityTypeConfiguration<Walkthrough>
{
    public void Configure(EntityTypeBuilder<Walkthrough> builder)
    {
        builder.ToTable("Walkthroughs");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(w => w.TargetRoute)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(w => w.Trigger)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(w => w.Priority)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(w => w.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasMany(w => w.Steps)
            .WithOne()
            .HasForeignKey(s => s.WalkthroughId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(w => new { w.TenantId, w.TargetRoute, w.IsActive });
    }
}
