using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Infrastructure.Persistence.EntityConfigurations;

public class AbacRuleConfiguration : IEntityTypeConfiguration<AbacRule>
{
    public void Configure(EntityTypeBuilder<AbacRule> builder)
    {
        builder.ToTable("AbacRules");

        builder.Property(a => a.Name).IsRequired().HasMaxLength(200);
        builder.Property(a => a.Description).HasMaxLength(1000);
        builder.Property(a => a.AttributeName).IsRequired().HasMaxLength(100);
        builder.Property(a => a.AttributeValue).IsRequired().HasMaxLength(500);
        builder.Property(a => a.ResourceType).IsRequired().HasMaxLength(100);

        builder.Property(a => a.Operator)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(a => a.Effect)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.HasIndex(a => a.ResourceType);
        builder.HasIndex(a => a.Priority);
    }
}
