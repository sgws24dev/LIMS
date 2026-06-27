using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Infrastructure.Persistence.EntityConfigurations;

public class IoTRuleConfiguration : IEntityTypeConfiguration<IoTRule>
{
    public void Configure(EntityTypeBuilder<IoTRule> builder)
    {
        builder.ToTable("IoTRules");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.MetricName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.ConditionType).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Severity).HasMaxLength(50).IsRequired();
    }
}
