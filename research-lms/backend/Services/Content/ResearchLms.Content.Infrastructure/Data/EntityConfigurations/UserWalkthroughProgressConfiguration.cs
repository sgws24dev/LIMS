using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Infrastructure.Data.EntityConfigurations;

public class UserWalkthroughProgressConfiguration : IEntityTypeConfiguration<UserWalkthroughProgress>
{
    public void Configure(EntityTypeBuilder<UserWalkthroughProgress> builder)
    {
        builder.ToTable("UserWalkthroughProgress");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.UserId)
            .IsRequired();

        builder.Property(p => p.WalkthroughId)
            .IsRequired();

        builder.Property(p => p.CurrentStepIndex);

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.CompletedAt);

        builder.HasIndex(p => new { p.TenantId, p.UserId, p.WalkthroughId }).IsUnique();
    }
}