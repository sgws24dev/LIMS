using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class AutomationRuleConfiguration : IEntityTypeConfiguration<AutomationRule>
{
    public void Configure(EntityTypeBuilder<AutomationRule> builder)
    {
        builder.ToTable("AutomationRules");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.TriggerType).HasMaxLength(50).IsRequired();
        builder.Property(e => e.TriggerConfig).HasMaxLength(8000);
        builder.Property(e => e.ActionType).HasMaxLength(50).IsRequired();
        builder.Property(e => e.ActionConfig).HasMaxLength(8000);
    }
}
